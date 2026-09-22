import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCustomers } from "@/hooks/use-customers";
import { makeCustomer, makeDataset } from "@/tests/fixtures/factories";

const mocks = vi.hoisted(() => ({ getToken: vi.fn(), listDatasets: vi.fn(), listDatasetCustomers: vi.fn(), listDatasetPredictions: vi.fn() }));
vi.mock("@clerk/nextjs", () => ({ useAuth: () => ({ getToken: mocks.getToken }) }));
vi.mock("@/lib/api/datasets", () => ({ listDatasets: mocks.listDatasets }));
vi.mock("@/lib/api/customer", () => ({ listDatasetCustomers: mocks.listDatasetCustomers }));
vi.mock("@/lib/api/predictions", () => ({ listDatasetPredictions: mocks.listDatasetPredictions }));

describe("useCustomers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getToken.mockResolvedValue("token");
    mocks.listDatasetCustomers.mockResolvedValue([makeCustomer()]);
    mocks.listDatasetPredictions.mockResolvedValue([{ id: "prediction-1" }]);
  });

  it("selects the newest completed dataset and loads related records", async () => {
    mocks.listDatasets.mockResolvedValue([
      makeDataset({ id: "older", created_at: "2026-09-01T00:00:00Z" }),
      makeDataset({ id: "pending", upload_status: "processing", created_at: "2026-09-20T00:00:00Z" }),
      makeDataset({ id: "newest", created_at: "2026-09-10T00:00:00Z" }),
    ]);
    const { result } = renderHook(() => useCustomers());
    await waitFor(() => expect(result.current.dataset?.id).toBe("newest"));
    expect(result.current.dataset?.id).toBe("newest");
    expect(mocks.listDatasetCustomers).toHaveBeenCalledWith("token", "newest");
    expect(mocks.listDatasetPredictions).toHaveBeenCalledWith("token", "newest");
    expect(result.current.customers).toHaveLength(1);
  });

  it("uses an explicitly selected dataset", async () => {
    mocks.listDatasets.mockResolvedValue([makeDataset({ id: "chosen" }), makeDataset({ id: "other" })]);
    const { result } = renderHook(() => useCustomers("chosen"));
    await waitFor(() => expect(result.current.dataset?.id).toBe("chosen"));
    expect(mocks.listDatasetCustomers).toHaveBeenCalledWith("token", "chosen");
  });

  it("clears stale data and reports authentication failures", async () => {
    mocks.getToken.mockResolvedValue(null);
    mocks.listDatasets.mockResolvedValue([]);
    const { result } = renderHook(() => useCustomers());
    await waitFor(() =>
      expect(result.current.error).toBe("Unable to authenticate customer request"),
    );
    expect(result.current.error).toBe("Unable to authenticate customer request");
    expect(result.current.customers).toEqual([]);
    expect(result.current.predictions).toEqual([]);
  });
});
