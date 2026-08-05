import { apiGet } from "@/lib/api/client";
import type { PredictionOverview, PredictionRead } from "@/types/api";

export async function getPredictionOverview(
    token: string,
    datasetId: string,
    page = 1,
    pageSize = 20
): Promise<PredictionOverview> {
    const query = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
    });

    return apiGet<PredictionOverview>(
        `/predictions/dataset/${encodeURIComponent(datasetId)}/overview?${query}`,
        token
    );
}

export async function listDatasetPredictions(
    token: string,
    datasetId: string
) : Promise<PredictionRead[]> {
    return apiGet<PredictionRead[]>(
        `/predictions/dataset/${encodeURIComponent(datasetId)}`,
        token
    );
}

export async function getPrediction(
    token: string,
    predictionId: string
):  Promise<PredictionRead> {
    return apiGet<PredictionRead>(
        `/predictions/${encodeURIComponent(predictionId)}`,
        token
  );
}
