import { apiGet } from "@/lib/api/client";
import type { PredictionRead } from "@/types/api";

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