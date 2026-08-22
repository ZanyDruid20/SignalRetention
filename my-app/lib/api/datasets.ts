import { apiDelete, apiGet, apiUpload } from "@/lib/api/client";
import type { DatasetRead } from "@/types/api";

export async function uploadDataset(
  token: string,
  file: File
): Promise<DatasetRead> {
  const formData = new FormData();
  formData.append("file", file);

  return apiUpload<DatasetRead>("/datasets/upload", token, formData);
}

export async function listDatasets(token: string): Promise<DatasetRead[]> {
  return apiGet<DatasetRead[]>("/datasets", token);
}

export async function deleteDataset(
  token: string,
  datasetId: string
): Promise<void> {
  return apiDelete(`/datasets/${encodeURIComponent(datasetId)}`, token);
}
