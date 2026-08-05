"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

import { listDatasetCustomers } from "@/lib/api/customer";
import { listDatasets } from "@/lib/api/datasets";
import { listDatasetPredictions } from "@/lib/api/predictions";
import type { CustomerRead, DatasetRead, PredictionRead } from "@/types/api";

type UseCustomerResult = {
    customers: CustomerRead[];
    predictions: PredictionRead[];
    dataset: DatasetRead | null;
    error: string | null;
    isLoading: boolean;
    refresh: () => Promise<void>;
}

export function useCustomers(datasetId? : string) : UseCustomerResult {
    const { getToken } = useAuth();
    const [customers, setCustomers] = useState<CustomerRead[]>([]);
    const [predictions, setPredictions] = useState<PredictionRead[]>([]);
    const [dataset, setDataset] = useState<DatasetRead | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);



    const loadCustomers = useCallback(async() => {
        try {
            const token = await getToken({ template: "signalretention" });
            setIsLoading(true);
            setError(null);

            if (!token) {
                throw new Error("Unable to authenticate customer request");
            }
            const availableDatasets = await listDatasets(token);
            const selectedDataset = datasetId ? availableDatasets.find((item) => item.id === datasetId) :
            availableDatasets.filter((item) => item.upload_status === "completed").sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] || null;

            if (!selectedDataset) {
                setDataset(null);
                setCustomers([]);
                setPredictions([]);
                return;
            }
            setDataset(selectedDataset);

            const [customerResults, predictionResults] = await Promise.all([
                listDatasetCustomers(token, selectedDataset.id),
                listDatasetPredictions(token, selectedDataset.id),
            ]);

            setCustomers(customerResults);
            setPredictions(predictionResults);
        } catch (error) {
            setDataset(null);
            setCustomers([]);
            setPredictions([]);
            setError(error instanceof Error ? error.message : "Unable to load customer data");

        } finally {
            setIsLoading(false);
        }

    } , [getToken, datasetId]);
    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadCustomers();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [loadCustomers]);
    return {
        customers,
        predictions,
        dataset,
        error,
        isLoading,
        refresh: loadCustomers,
    }


}
