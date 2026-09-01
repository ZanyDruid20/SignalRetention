"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

import { getDatasetDashboard } from "@/lib/api/dashboard";
import { listDatasets } from "@/lib/api/datasets";
import type { DashboardSummary, DatasetRead } from "@/types/api";

export function useDashboard() {
  const { getToken } = useAuth();
  const [datasets, setDatasets] = useState<DatasetRead[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState("");
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = useCallback(async () => {
    const token = await getToken({ template: "signalretention" });
    if (!token) throw new Error("Authentication is required");
    return token;
  }, [getToken]);

  const loadSummary = useCallback(
    async (datasetId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const token = await getAuthToken();
        const nextSummary = await getDatasetDashboard(token, datasetId);
        setSummary(nextSummary);
      } catch {
        setSummary(null);
        setError("Unable to load dashboard data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [getAuthToken]
  );

  const initialize = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      const availableDatasets = (await listDatasets(token))
        .filter((dataset) => dataset.upload_status === "completed")
        .sort(
          (left, right) =>
            new Date(right.created_at).getTime() -
            new Date(left.created_at).getTime()
        );

      setDatasets(availableDatasets);
      const initialDataset = availableDatasets[0];
      if (!initialDataset) {
        setSelectedDatasetId("");
        setSummary(null);
        return;
      }

      setSelectedDatasetId(initialDataset.id);
      setSummary(await getDatasetDashboard(token, initialDataset.id));
    } catch {
      setError("Unable to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void initialize();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [initialize]);

  const selectDataset = useCallback(
    (datasetId: string) => {
      setSelectedDatasetId(datasetId);
      void loadSummary(datasetId);
    },
    [loadSummary]
  );

  const refresh = useCallback(() => {
    if (selectedDatasetId) void loadSummary(selectedDatasetId);
    else void initialize();
  }, [initialize, loadSummary, selectedDatasetId]);

  return {
    datasets,
    selectedDatasetId,
    summary,
    isLoading,
    error,
    selectDataset,
    refresh,
  };
}
