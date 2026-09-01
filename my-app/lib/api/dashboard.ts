import { apiGet } from "@/lib/api/client";
import type { DashboardSummary } from "@/types/api";

export function getDatasetDashboard(
  token: string,
  datasetId: string
): Promise<DashboardSummary> {
  return apiGet<DashboardSummary>(
    `/dashboard/dataset/${encodeURIComponent(datasetId)}`,
    token
  );
}
