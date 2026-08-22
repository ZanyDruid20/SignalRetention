import { useState } from "react";
import { CheckCircle, Eye, Loader2, Trash2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DatasetRead } from "@/types/api";

type Dataset = {
  id: string;
  name: string;
  rows: string;
  status: "Processed" | "Processing" | "Failed";
  uploadedAt: string;
};

function mapDataset(dataset: DatasetRead): Dataset {
  return {
    id: dataset.id,
    name: dataset.filename,
    rows: dataset.record_count.toLocaleString(),
    status:
      dataset.upload_status === "completed"
        ? "Processed"
        : dataset.upload_status === "failed"
          ? "Failed"
          : "Processing",
    uploadedAt: new Date(dataset.created_at).toLocaleDateString(),
  };
}

function StatusBadge({ status }: { status: Dataset["status"] }) {
  const styles = {
    Processed: "bg-green-50 text-green-700 border-green-200",
    Processing: "bg-orange-50 text-orange-700 border-orange-200",
    Failed: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`rounded-full border px-4 py-1 text-sm font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

type DatasetTableProps = {
  uploadedDatasets?: DatasetRead[];
  isLoading?: boolean;
  error?: string | null;
  deletingDatasetId: string | null;
  deleteError: string | null;
  onDeleteDataset: (datasetId: string) => Promise<boolean>;
};

export function DatasetTable({
  uploadedDatasets = [],
  isLoading = false,
  error = null,
  deletingDatasetId,
  deleteError,
  onDeleteDataset,
}: DatasetTableProps) {
  const [datasetToDelete, setDatasetToDelete] = useState<Dataset | null>(null);
  const datasets = uploadedDatasets.map(mapDataset);

  async function confirmDelete() {
    if (!datasetToDelete) return;

    const deleted = await onDeleteDataset(datasetToDelete.id);
    if (deleted) setDatasetToDelete(null);
  }

  return (
    <Card className="border-[#E7DED1] bg-white shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Uploaded Datasets
        </CardTitle>
      </CardHeader>

      <CardContent className="overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-225">
            <thead>
              <tr className="border-b text-left text-muted-foreground dark:border-[#3A312A]">
                <th className="px-4 pb-4 text-lg font-semibold">Dataset</th>
                <th className="px-4 pb-4 text-lg font-semibold">Rows</th>
                <th className="px-4 pb-4 text-lg font-semibold">Status</th>
                <th className="px-4 pb-4 text-lg font-semibold">Uploaded</th>
                <th className="px-4 pb-4" />
              </tr>
            </thead>

            <tbody>
              {isLoading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    Loading datasets...
                  </td>
                </tr>
              )}

              {!isLoading && error && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-red-700"
                  >
                    {error}
                  </td>
                </tr>
              )}

              {!isLoading && !error && datasets.map((dataset) => (
                <tr
                  key={dataset.id}
                  className="border-b transition-colors hover:bg-[#F8F5F0] dark:border-[#3A312A] dark:hover:bg-muted/40"
                >
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-[#F1ECE4] p-3 dark:bg-muted">
                        <CheckCircle className="h-5 w-5 text-green-700" />
                      </div>

                      <div>
                        <p className="font-semibold">{dataset.name}</p>
                        <p className="text-sm text-muted-foreground">
                          CSV dataset
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-5 font-semibold">{dataset.rows}</td>
                  <td className="px-4 py-5">
                    <StatusBadge status={dataset.status} />
                  </td>

                  <td className="px-4 py-5 text-muted-foreground">
                    {dataset.uploadedAt}
                  </td>

                  <td className="px-4 py-5">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        disabled
                        title="View coming soon"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        title={`Delete ${dataset.name}`}
                        aria-label={`Delete ${dataset.name}`}
                        disabled={deletingDatasetId !== null}
                        onClick={() => setDatasetToDelete(dataset)}
                      >
                        {deletingDatasetId === dataset.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {!isLoading && !error && datasets.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    No datasets uploaded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      <Dialog
        open={datasetToDelete !== null}
        onOpenChange={(open) => {
          if (!open && deletingDatasetId === null) setDatasetToDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete dataset?</DialogTitle>
            <DialogDescription>
              This permanently deletes {datasetToDelete?.name}, its uploaded
              CSV, customers, predictions, and recommendations. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <p role="alert" className="text-sm text-red-700">
              {deleteError}
            </p>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={deletingDatasetId !== null}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              disabled={deletingDatasetId !== null}
              onClick={() => void confirmDelete()}
            >
              {deletingDatasetId !== null && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Delete dataset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
