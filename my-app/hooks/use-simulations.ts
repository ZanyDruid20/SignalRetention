"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

import {
  createSimulation,
  listSimulations,
} from "@/lib/api/simulations";
import { listDatasets } from "@/lib/api/datasets";
import type {
  DatasetRead,
  SimulationRead,
  SimulationRequest,
} from "@/types/api";

type UseSimulationsResult = {
  datasets: DatasetRead[];
  simulations: SimulationRead[];
  result: SimulationRead | null;
  isLoading: boolean;
  isRunning: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  runSimulation: (request: SimulationRequest) => Promise<SimulationRead>;
};

export function useSimulations(): UseSimulationsResult {
  const { getToken } = useAuth();
  const [datasets, setDatasets] = useState<DatasetRead[]>([]);
  const [simulations, setSimulations] = useState<SimulationRead[]>([]);
  const [result, setResult] = useState<SimulationRead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSimulations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await getToken({ template: "signalretention" });
      if (!token) {
        throw new Error("Unable to authenticate simulation request");
      }

      const [availableDatasets, simulationHistory] = await Promise.all([
        listDatasets(token),
        listSimulations(token),
      ]);
      setDatasets(
        availableDatasets
          .filter((dataset) => dataset.upload_status === "completed")
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
      );
      setSimulations(simulationHistory);
    } catch (caughtError) {
      setDatasets([]);
      setSimulations([]);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load simulations"
      );
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadSimulations();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadSimulations]);

  const runSimulation = useCallback(
    async (request: SimulationRequest): Promise<SimulationRead> => {
      setIsRunning(true);
      setError(null);

      try {
        const token = await getToken({ template: "signalretention" });
        if (!token) {
          throw new Error("Unable to authenticate simulation request");
        }

        const createdSimulation = await createSimulation(token, request);
        setResult(createdSimulation);
        setSimulations((current) => [createdSimulation, ...current]);
        return createdSimulation;
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to run simulation"
        );
        throw caughtError;
      } finally {
        setIsRunning(false);
      }
    },
    [getToken]
  );

  return {
    datasets,
    simulations,
    result,
    isLoading,
    isRunning,
    error,
    refresh: loadSimulations,
    runSimulation,
  };
}
