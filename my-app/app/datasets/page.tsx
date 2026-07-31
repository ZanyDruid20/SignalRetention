"use client";

import { useState } from "react";

import { DatasetsHeader } from "@/components/datasets/datasets-header";
import { DatasetsStats } from "@/components/datasets/datasets-stats";
import { DataSetsUploader } from "@/components/datasets/datasets-uploader";
import { DatasetTable } from "@/components/datasets/datasets-table";
import { useDatasetUpload } from "@/hooks/use-datasets";
import type { DatasetRead } from "@/types/api";

export default function DatasetsPage() {
  const [search, setSearch] = useState("");
  const [uploadedDatasets, setUploadedDatasets] = useState<DatasetRead[]>([]);
  const { error, status, uploadFile } = useDatasetUpload();

  function handleUploadComplete(dataset: DatasetRead) {
    setUploadedDatasets((currentDatasets) => [dataset, ...currentDatasets]);
  }

  return (
    <div className="min-h-screen bg-[#F5F1EA] dark:bg-background">
      <header className="border-b border-[#D8D0C5] bg-[#FBFAF7] px-12 py-6 dark:border-border dark:bg-background">
        <DatasetsHeader search={search} onSearchChange={setSearch} />
      </header>

      <main className="space-y-8 px-12 py-8">
        <DatasetsStats
          totalDatasets={12}
          activeDatasets={8}
          pendingDatasets={4}
        />

        <DataSetsUploader
          error={error}
          status={status}
          onUploadFile={uploadFile}
          onUploadComplete={handleUploadComplete}
        />
        <DatasetTable uploadedDatasets={uploadedDatasets} />

      </main>
    </div>
  );
}
