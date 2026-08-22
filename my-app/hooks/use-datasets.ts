"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useState } from "react";

import { deleteDataset, uploadDataset } from "@/lib/api/datasets";
import type { DatasetRead } from "@/types/api";

type UploadStatus = "idle" | "uploading" | "processed" | "error";

type UseDatasetUploadResult = {
  dataset: DatasetRead | null;
  error: string | null;
  status: UploadStatus;
  uploadFile: (file: File) => Promise<DatasetRead>;
  reset: () => void;
};

type UseDatasetDeleteResult = {
  deletingDatasetId: string | null;
  deleteError: string | null;
  removeDataset: (datasetId: string) => Promise<boolean>;
};

export function useDatasetUpload(): UseDatasetUploadResult {
  const { getToken } = useAuth();
  const [dataset, setDataset] = useState<DatasetRead | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");

  const uploadFile = useCallback(
    async (file: File) => {
      setStatus("uploading");
      setError(null);
      setDataset(null);

      try {
        const token = await getToken({ template: "signalretention" });

        if (!token) {
          throw new Error("Unable to authenticate upload request");
        }

        const uploadedDataset = await uploadDataset(token, file);
        setDataset(uploadedDataset);
        setStatus("processed");
        return uploadedDataset;
      } catch (error) {
        setStatus("error");
        setError(
          error instanceof Error ? error.message : "Unable to upload dataset"
        );
        throw error;
      }
    },
    [getToken]
  );

  function reset() {
    setDataset(null);
    setError(null);
    setStatus("idle");
  }

  return {
    dataset,
    error,
    status,
    uploadFile,
    reset,
  };
}

export function useDatasetDelete(): UseDatasetDeleteResult {
  const { getToken } = useAuth();
  const [deletingDatasetId, setDeletingDatasetId] = useState<string | null>(
    null
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const removeDataset = useCallback(
    async (datasetId: string): Promise<boolean> => {
      setDeletingDatasetId(datasetId);
      setDeleteError(null);

      try {
        const token = await getToken({ template: "signalretention" });
        if (!token) {
          throw new Error("Unable to authenticate dataset deletion");
        }

        await deleteDataset(token, datasetId);
        return true;
      } catch (caughtError) {
        setDeleteError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to delete dataset"
        );
        return false;
      } finally {
        setDeletingDatasetId(null);
      }
    },
    [getToken]
  );

  return {
    deletingDatasetId,
    deleteError,
    removeDataset,
  };
}
