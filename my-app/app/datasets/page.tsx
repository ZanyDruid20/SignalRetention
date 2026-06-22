"use client";

import { useState } from "react";

import { DatasetsHeader } from "@/components/datasets/datasets-header";
import { DatasetsStats } from "@/components/datasets/datasets-stats";
import { DataSetsUploader } from "@/components/datasets/datasets-uploader";
import { DatasetTable } from "@/components/datasets/datasets-table";

export default function DatasetsPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-[#F5F1EA]">
      <header className="border-b border-[#D8D0C5] bg-[#FBFAF7] px-12 py-6">
        <DatasetsHeader search={search} onSearchChange={setSearch} />
      </header>

      <main className="space-y-8 px-12 py-8">
        <DatasetsStats
          totalDatasets={12}
          activeDatasets={8}
          pendingDatasets={4}
        />

        <DataSetsUploader />
        <DatasetTable />

      </main>
    </div>
  );
}
