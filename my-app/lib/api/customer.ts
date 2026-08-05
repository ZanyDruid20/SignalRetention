import { apiGet } from "@/lib/api/client";
import type { CustomerExplorerPage, CustomerRead, RiskTier } from "@/types/api";

export type CustomerExplorerParams = {
  page: number;
  pageSize: number;
  search?: string;
  riskTiers?: RiskTier[];
  contractType?: string;
  minHealth?: number;
  maxHealth?: number;
  minRevenue?: number;
  maxRevenue?: number;
};

export async function getCustomer(
  token: string,
  customerId: string
): Promise<CustomerRead> {
  return apiGet<CustomerRead>(
    `/customers/${encodeURIComponent(customerId)}`,
    token
  );
}

export async function listDatasetCustomers(
  token: string,
  datasetId: string
): Promise<CustomerRead[]> {
  return apiGet<CustomerRead[]>(
    `/customers/dataset/${encodeURIComponent(datasetId)}`,
    token
  );
}

export async function getCustomerExplorerPage(
  token: string,
  datasetId: string,
  params: CustomerExplorerParams
): Promise<CustomerExplorerPage> {
  const query = new URLSearchParams({
    page: String(params.page),
    page_size: String(params.pageSize),
  });

  if (params.search) query.set("search", params.search);
  params.riskTiers?.forEach((riskTier) => query.append("risk_tier", riskTier));
  if (params.contractType) query.set("contract_type", params.contractType);
  if (params.minHealth !== undefined) query.set("min_health", String(params.minHealth));
  if (params.maxHealth !== undefined) query.set("max_health", String(params.maxHealth));
  if (params.minRevenue !== undefined) query.set("min_revenue", String(params.minRevenue));
  if (params.maxRevenue !== undefined) query.set("max_revenue", String(params.maxRevenue));

  return apiGet<CustomerExplorerPage>(
    `/customers/dataset/${encodeURIComponent(datasetId)}/explorer?${query}`,
    token
  );
}
