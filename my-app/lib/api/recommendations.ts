import { apiGet, apiPatch } from "@/lib/api/client";
import type {
  RecommendationOverview,
  RecommendationRead,
  RecommendationStatus,
} from "@/types/api";

export function getRecommendationOverview(
  token: string,
  datasetId: string,
  page = 1,
  pageSize = 10,
  status?: RecommendationStatus,
  search?: string
): Promise<RecommendationOverview> {
  const query = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  if (status) query.set("status", status);
  if (search) query.set("search", search);

  return apiGet<RecommendationOverview>(
    `/recommendations/dataset/${datasetId}/overview?${query}`,
    token
  );
}

export function updateRecommendationStatus(
  token: string,
  recommendationId: string,
  status: RecommendationStatus
): Promise<RecommendationRead> {
  return apiPatch<RecommendationRead, { status: RecommendationStatus }>(
    `/recommendations/${recommendationId}/status`,
    token,
    { status }
  );
}
