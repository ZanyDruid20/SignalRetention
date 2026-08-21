"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

import { listDatasets } from "@/lib/api/datasets";
import {
  getRecommendationOverview,
  updateRecommendationStatus,
} from "@/lib/api/recommendations";
import type {
  DatasetRead,
  RecommendationOverview,
  RecommendationStatus,
} from "@/types/api";

const PAGE_SIZE = 10;

type UseRecommendationsResult = {
  dataset: DatasetRead | null;
  overview: RecommendationOverview | null;
  isLoading: boolean;
  updatingId: string | null;
  error: string | null;
  hasDataset: boolean;
  refresh: () => Promise<void>;
  setStatus: (recommendationId: string, status: RecommendationStatus) => Promise<void>;
};

export function useRecommendations(
  page: number,
  status: RecommendationStatus | "all",
  search: string,
  datasetId?: string
): UseRecommendationsResult {
  const { getToken } = useAuth();
  const [dataset, setDataset] = useState<DatasetRead | null>(null);
  const [overview, setOverview] = useState<RecommendationOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadRecommendations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await getToken({ template: "signalretention" });
      if (!token) throw new Error("Unable to authenticate recommendation request");

      const datasets = await listDatasets(token);
      const selectedDataset = datasetId
        ? datasets.find((item) => item.id === datasetId) ?? null
        : datasets
            .filter((item) => item.upload_status === "completed")
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0] ?? null;

      setDataset(selectedDataset);
      if (!selectedDataset) {
        setOverview(null);
        return;
      }

      setOverview(
        await getRecommendationOverview(
          token,
          selectedDataset.id,
          page,
          PAGE_SIZE,
          status === "all" ? undefined : status,
          search || undefined
        )
      );
    } catch (caughtError) {
      setOverview(null);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load recommendations"
      );
    } finally {
      setIsLoading(false);
    }
  }, [datasetId, getToken, page, search, status]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadRecommendations();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadRecommendations]);

  const setStatus = useCallback(
    async (recommendationId: string, status: RecommendationStatus) => {
      const token = await getToken({ template: "signalretention" });
      if (!token) throw new Error("Unable to authenticate recommendation update");

      setUpdatingId(recommendationId);
      setError(null);
      try {
        await updateRecommendationStatus(token, recommendationId, status);
        await loadRecommendations();
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to update recommendation"
        );
        throw caughtError;
      } finally {
        setUpdatingId(null);
      }
    },
    [getToken, loadRecommendations]
  );

  return {
    dataset,
    overview,
    isLoading,
    updatingId,
    error,
    hasDataset: dataset !== null,
    refresh: loadRecommendations,
    setStatus,
  };
}
