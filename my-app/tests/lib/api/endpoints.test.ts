import { beforeEach, describe, expect, it, vi } from "vitest";

import { getCurrentUser } from "@/lib/api/auth";
import { getCustomerDetail, getCustomerExplorerPage } from "@/lib/api/customer";
import { getDatasetDashboard } from "@/lib/api/dashboard";
import { deleteDataset, listDatasets, uploadDataset } from "@/lib/api/datasets";
import { getPredictionOverview } from "@/lib/api/predictions";
import { getRecommendationOverview, updateRecommendationStatus } from "@/lib/api/recommendations";
import { createSimulation, getSimulation } from "@/lib/api/simulations";

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockImplementation(async () =>
    new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
  vi.stubGlobal("fetch", fetchMock);
});

function requestedUrl() {
  return String(fetchMock.mock.calls.at(-1)?.[0]);
}

describe("endpoint wrappers", () => {
  it("uses the auth and dataset endpoints", async () => {
    await getCurrentUser("token");
    expect(requestedUrl().endsWith("/auth/me")).toBe(true);

    await listDatasets("token");
    expect(requestedUrl().endsWith("/datasets")).toBe(true);
  });

  it("uploads the selected file under the file field", async () => {
    const file = new File(["customerID"], "customers.csv", { type: "text/csv" });

    await uploadDataset("token", file);

    const request = fetchMock.mock.calls.at(-1)?.[1];
    expect(request?.body).toBeInstanceOf(FormData);
    expect((request?.body as FormData).get("file")).toBe(file);
  });

  it("encodes dataset IDs before deletion", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await deleteDataset("token", "dataset/with spaces");

    expect(requestedUrl().endsWith("/datasets/dataset%2Fwith%20spaces")).toBe(true);
  });

  it("encodes customer IDs for detail requests", async () => {
    await getCustomerDetail("token", "customer/one");
    expect(requestedUrl()).toContain("/customers/customer%2Fone/detail");
  });

  it("serializes every customer explorer filter", async () => {
    await getCustomerExplorerPage("token", "dataset one", {
      page: 2,
      pageSize: 50,
      search: "CUST 10",
      riskTiers: ["Critical", "High"],
      contractType: "Month-to-month",
      minHealth: 10,
      maxHealth: 80,
      minRevenue: 20,
      maxRevenue: 100,
    });

    const url = new URL(requestedUrl());
    expect(url.pathname).toBe("/customers/dataset/dataset%20one/explorer");
    expect(url.searchParams.getAll("risk_tier")).toEqual(["Critical", "High"]);
    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      page: "2",
      page_size: "50",
      search: "CUST 10",
      contract_type: "Month-to-month",
      min_health: "10",
      max_health: "80",
      min_revenue: "20",
      max_revenue: "100",
    });
  });

  it("serializes prediction and recommendation pagination", async () => {
    await getPredictionOverview("token", "dataset-1", 3, 20);
    expect(requestedUrl()).toContain("page=3&page_size=20");

    await getRecommendationOverview("token", "dataset-1", 2, 10, "completed", "CUST");
    expect(requestedUrl()).toContain("page=2&page_size=10&status=completed&search=CUST");
  });

  it("sends recommendation status updates", async () => {
    await updateRecommendationStatus("token", "recommendation-1", "in_progress");

    expect(fetchMock.mock.calls.at(-1)?.[1]).toMatchObject({
      method: "PATCH",
      body: JSON.stringify({ status: "in_progress" }),
    });
  });

  it("uses dashboard and simulation endpoints", async () => {
    await getDatasetDashboard("token", "dataset/1");
    expect(requestedUrl().endsWith("/dashboard/dataset/dataset%2F1")).toBe(true);

    await createSimulation("token", {
      dataset_id: "dataset-1",
      intervention_type: "discount",
      target_segment: "high-risk",
      intensity_percentage: 50,
    });
    expect(requestedUrl().endsWith("/simulations")).toBe(true);

    await getSimulation("token", "simulation/1");
    expect(requestedUrl().endsWith("/simulations/simulation%2F1")).toBe(true);
  });
});
