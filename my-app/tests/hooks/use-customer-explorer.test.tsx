import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCustomerExplorer } from "@/hooks/use-customer-explorer";
import {
  makeCustomerExplorerPage,
  makeDataset,
} from "@/tests/fixtures/factories";

const mocks = vi.hoisted(() => ({
  deleteCustomer: vi.fn(),
  getCustomerExplorerPage: vi.fn(),
  getToken: vi.fn(),
  listDatasets: vi.fn(),
}));

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ getToken: mocks.getToken }),
}));
vi.mock("@/lib/api/customer", () => ({
  deleteCustomer: mocks.deleteCustomer,
  getCustomerExplorerPage: mocks.getCustomerExplorerPage,
}));
vi.mock("@/lib/api/datasets", () => ({ listDatasets: mocks.listDatasets }));

const filters = {
  page: 1,
  pageSize: 50,
  search: " CUST ",
  riskTiers: ["Critical" as const],
  minHealth: 10,
  maxRevenue: 100,
};

describe("useCustomerExplorer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getToken.mockResolvedValue("test-token");
    mocks.listDatasets.mockResolvedValue([makeDataset({ id: "dataset-1" })]);
    mocks.getCustomerExplorerPage.mockResolvedValue(makeCustomerExplorerPage());
  });

  it("loads filters and normalizes API values for the customer table", async () => {
    const { result } = renderHook(() => useCustomerExplorer(filters));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mocks.getCustomerExplorerPage).toHaveBeenCalledWith(
      "test-token",
      "dataset-1",
      expect.objectContaining({
        page: 1,
        pageSize: 50,
        search: "CUST",
        riskTiers: ["Critical"],
        minHealth: 10,
        maxRevenue: 100,
      }),
    );
    expect(result.current.rows[0]).toEqual(
      expect.objectContaining({
        customerName: "CUST-001",
        churnProbability: 91,
        monthlyRevenue: 79.5,
        status: "Active",
      }),
    );
    expect(result.current.summary).toEqual({
      totalCustomers: 1,
      highRiskCustomers: 1,
      monthlyRevenueAtRisk: 79.5,
      averageHealthScore: 18,
    });
  });

  it("returns a no-dataset state without requesting customers", async () => {
    mocks.listDatasets.mockResolvedValue([]);
    const { result } = renderHook(() => useCustomerExplorer(filters));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.hasDataset).toBe(false);
    expect(result.current.rows).toEqual([]);
    expect(mocks.getCustomerExplorerPage).not.toHaveBeenCalled();
  });

  it("deletes an owned customer and refreshes the page", async () => {
    mocks.deleteCustomer.mockResolvedValue(undefined);
    const { result } = renderHook(() => useCustomerExplorer(filters));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await expect(result.current.removeCustomer("customer-1")).resolves.toBe(true);
    });

    expect(mocks.deleteCustomer).toHaveBeenCalledWith("test-token", "customer-1");
    expect(mocks.getCustomerExplorerPage).toHaveBeenCalledTimes(2);
    expect(result.current.deletingCustomerId).toBeNull();
  });

  it("preserves the page and exposes a safe deletion error on failure", async () => {
    mocks.deleteCustomer.mockRejectedValue(new Error("Customer not found"));
    const { result } = renderHook(() => useCustomerExplorer(filters));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await expect(result.current.removeCustomer("missing")).resolves.toBe(false);
    });

    expect(result.current.deleteError).toBe("Customer not found");
    expect(result.current.rows).toHaveLength(1);
  });
});
