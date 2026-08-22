"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  deleteCustomer,
  getCustomerExplorerPage,
} from "@/lib/api/customer";
import { listDatasets } from "@/lib/api/datasets";
import type { CustomerExplorerPage, DatasetRead, RiskTier } from "@/types/api";
import type {
  CustomerExplorerRow,
  CustomerExplorerSummaryView,
  CustomerStatus,
} from "@/types/view-models";

type CustomerExplorerFilters = {
  datasetId?: string;
  page: number;
  pageSize: number;
  search: string;
  riskTiers: RiskTier[];
  contractType?: string;
  minHealth?: number;
  maxHealth?: number;
  minRevenue?: number;
  maxRevenue?: number;
};

type UseCustomerExplorerResult = {
  rows: CustomerExplorerRow[];
  summary: CustomerExplorerSummaryView | null;
  page: number;
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  deletingCustomerId: string | null;
  deleteError: string | null;
  hasDataset: boolean;
  removeCustomer: (customerId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
};

function toNullableNumber(value: string | null): number | null {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getCustomerStatus(actualChurn: boolean | null): CustomerStatus {
  if (actualChurn === true) return "Inactive";
  if (actualChurn === false) return "Active";
  return "Unknown";
}

function selectDataset(datasets: DatasetRead[], datasetId?: string) {
  if (datasetId) return datasets.find((dataset) => dataset.id === datasetId) ?? null;

  return (
    datasets
      .filter((dataset) => dataset.upload_status === "completed")
      .sort(
        (left, right) =>
          new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
      )[0] ?? null
  );
}

export function useCustomerExplorer(
  filters: CustomerExplorerFilters
): UseCustomerExplorerResult {
  const { getToken } = useAuth();
  const [result, setResult] = useState<CustomerExplorerPage | null>(null);
  const [dataset, setDataset] = useState<DatasetRead | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(
    null
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await getToken({ template: "signalretention" });
      if (!token) throw new Error("Unable to authenticate customer request");

      const datasets = await listDatasets(token);
      const selectedDataset = selectDataset(datasets, filters.datasetId);

      if (!selectedDataset) {
        setDataset(null);
        setResult(null);
        return;
      }

      const pageResult = await getCustomerExplorerPage(token, selectedDataset.id, {
        page: filters.page,
        pageSize: filters.pageSize,
        search: filters.search.trim() || undefined,
        riskTiers: filters.riskTiers,
        contractType: filters.contractType,
        minHealth: filters.minHealth,
        maxHealth: filters.maxHealth,
        minRevenue: filters.minRevenue,
        maxRevenue: filters.maxRevenue,
      });

      setDataset(selectedDataset);
      setResult(pageResult);
    } catch (caughtError) {
      setResult(null);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load customer data"
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters, getToken]);

  const removeCustomer = useCallback(
    async (customerId: string): Promise<boolean> => {
      setDeletingCustomerId(customerId);
      setDeleteError(null);

      try {
        const token = await getToken({ template: "signalretention" });
        if (!token) {
          throw new Error("Unable to authenticate customer deletion");
        }

        await deleteCustomer(token, customerId);
        await loadCustomers();

        return true;
      } catch (caughtError) {
        setDeleteError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to delete customer"
        );

        return false;
      } finally {
        setDeletingCustomerId(null);
      }
    },
    [getToken, loadCustomers]
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadCustomers();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadCustomers]);

  const rows = useMemo<CustomerExplorerRow[]>(
    () =>
      (result?.items ?? []).map((customer) => {
        const churnProbability = toNullableNumber(customer.churn_probability);

        return {
          id: customer.id,
          customerName: customer.customer_identifier,
          riskTier: customer.risk_tier,
          healthScore: customer.health_score,
          churnProbability:
            churnProbability === null ? null : churnProbability * 100,
          monthlyRevenue: toNullableNumber(customer.monthly_revenue),
          contractType: customer.contract_type,
          status: getCustomerStatus(customer.actual_churn),
          lastActivity: null,
        };
      }),
    [result]
  );

  const summary = useMemo<CustomerExplorerSummaryView | null>(() => {
    if (!result) return null;

    return {
      totalCustomers: result.summary.total_customers,
      highRiskCustomers: result.summary.high_risk_customers,
      monthlyRevenueAtRisk:
        Number(result.summary.monthly_revenue_at_risk) || 0,
      averageHealthScore: toNullableNumber(
        result.summary.average_health_score
      ),
    };
  }, [result]);

  return {
    rows,
    summary,
    page: result?.page ?? filters.page,
    total: result?.total ?? 0,
    totalPages: result?.total_pages ?? 0,
    isLoading,
    error,
    deletingCustomerId,
    deleteError,
    hasDataset: dataset !== null,
    removeCustomer,
    refresh: loadCustomers,
  };
}
