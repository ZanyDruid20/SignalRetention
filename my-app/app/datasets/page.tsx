"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { listDatasets } from "@/lib/api/datasets";

import { DatasetsHeader } from "@/components/datasets/datasets-header";
import { DatasetsStats } from "@/components/datasets/datasets-stats";
import { DataSetsUploader } from "@/components/datasets/datasets-uploader";
import { DatasetTable } from "@/components/datasets/datasets-table";
import { useDatasetUpload } from "@/hooks/use-datasets";
import type { DatasetRead } from "@/types/api";

export default function DatasetsPage() {
  const { getToken } = useAuth();
  const [search, setSearch] = useState("");
  const [datasets, setDatasets] = useState<DatasetRead[]>([]);
  const [isLoadingDatasets, setIsLoadingDatasets] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const { error, status, uploadFile } = useDatasetUpload();
  const loadDatasets = useCallback(async () => {
    try {
      const token = await getToken({ template: "signalretention" });
      setIsLoadingDatasets(true);
      setListError(null);

      if (!token) {
        throw new Error("Unable to authenticate data request: try again.");
      }
      const datasetList = await listDatasets(token);
      setDatasets(datasetList);
    } catch (error) {
      console.error("Error loading datasets:", error);
      setListError("Failed to load datasets. Please try again later.");
    } finally {
      setIsLoadingDatasets(false);
    }
  }, [getToken]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDatasets();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadDatasets]);

  function handleUploadComplete(dataset: DatasetRead) {
    setDatasets((currentDatasets) => [dataset, ...currentDatasets]);
  }
  const totalDatasets = datasets.length;
  const activeDatasets = datasets.filter(
    (dataset) => dataset.upload_status === "completed"
  ).length;
  const pendingDatasets = datasets.filter(
    (dataset) => dataset.upload_status === "processing"
  ).length;
  return (
    <div className="min-h-screen bg-[#F5F1EA] dark:bg-background">
      <header className="border-b border-[#D8D0C5] bg-[#FBFAF7] px-12 py-6 dark:border-border dark:bg-background">
        <DatasetsHeader search={search} onSearchChange={setSearch} />
      </header>

      <main className="space-y-8 px-12 py-8">
        <DatasetsStats
          totalDatasets={totalDatasets}
          activeDatasets={activeDatasets}
          pendingDatasets={pendingDatasets}
        />

        <DataSetsUploader
          error={error}
          status={status}
          onUploadFile={uploadFile}
          onUploadComplete={handleUploadComplete}
        />
        <DatasetTable
          uploadedDatasets={datasets}
          isLoading={isLoadingDatasets}
          error={listError}
        />
      </main>
    </div>
  );
}
