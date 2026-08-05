"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

import { getPredictionOverview } from "@/lib/api/predictions";
import { listDatasets } from "@/lib/api/datasets";
import type { DatasetRead, PredictionOverview } from "@/types/api";

type UsePredictionsResult = {
  overview: PredictionOverview | null;
  isLoading: boolean;
  error: string | null;
  hasDataset: boolean;
  refresh: () => Promise<void>;
};

function selectDataset(datasets: DatasetRead[], datasetId?: string) {
  if (datasetId) {
    return datasets.find((dataset) => dataset.id === datasetId) ?? null;
  }

  return (
    datasets
      .filter((dataset) => dataset.upload_status === "completed")
      .sort(
        (left, right) =>
          new Date(right.created_at).getTime() -
          new Date(left.created_at).getTime()
      )[0] ?? null
  );
}

export function usePredictions(
  page: number,
  pageSize: number,
  datasetId?: string
): UsePredictionsResult {
  const { getToken } = useAuth();
  const [overview, setOverview] = useState<PredictionOverview | null>(null);
  const [hasDataset, setHasDataset] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPredictions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await getToken({ template: "signalretention" });
      if (!token) throw new Error("Unable to authenticate prediction request");

      const datasets = await listDatasets(token);
      const selectedDataset = selectDataset(datasets, datasetId);

      if (!selectedDataset) {
        setHasDataset(false);
        setOverview(null);
        return;
      }

      const result = await getPredictionOverview(
        token,
        selectedDataset.id,
        page,
        pageSize
      );

      setHasDataset(true);
      setOverview(result);
    } catch (caughtError) {
      setOverview(null);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load predictions"
      );
    } finally {
      setIsLoading(false);
    }
  }, [datasetId, getToken, page, pageSize]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadPredictions();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadPredictions]);

  return {
    overview,
    isLoading,
    error,
    hasDataset,
    refresh: loadPredictions,
  };
}
