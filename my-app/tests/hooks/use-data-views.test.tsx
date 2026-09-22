import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  makeDashboardSummary,
  makeDataset,
  makePredictionOverview,
  makeRecommendationOverview,
  makeSimulation,
} from "@/tests/fixtures/factories";
import { useDashboard } from "@/hooks/use-dashboard";
import { usePredictions } from "@/hooks/use-predictions";
import { useRecommendations } from "@/hooks/use-recommendations";
import { useSimulations } from "@/hooks/use-simulations";

const mocks = vi.hoisted(() => ({
  createSimulation: vi.fn(),
  getDatasetDashboard: vi.fn(),
  getPredictionOverview: vi.fn(),
  getRecommendationOverview: vi.fn(),
  getToken: vi.fn(),
  listDatasets: vi.fn(),
  listSimulations: vi.fn(),
  updateRecommendationStatus: vi.fn(),
}));

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ getToken: mocks.getToken }),
}));
vi.mock("@/lib/api/datasets", () => ({ listDatasets: mocks.listDatasets }));
vi.mock("@/lib/api/dashboard", () => ({
  getDatasetDashboard: mocks.getDatasetDashboard,
}));
vi.mock("@/lib/api/predictions", () => ({
  getPredictionOverview: mocks.getPredictionOverview,
}));
vi.mock("@/lib/api/recommendations", () => ({
  getRecommendationOverview: mocks.getRecommendationOverview,
  updateRecommendationStatus: mocks.updateRecommendationStatus,
}));
vi.mock("@/lib/api/simulations", () => ({
  createSimulation: mocks.createSimulation,
  listSimulations: mocks.listSimulations,
}));

const olderDataset = makeDataset({
  id: "older",
  created_at: "2026-09-01T00:00:00Z",
});
const newestDataset = makeDataset({
  id: "newest",
  created_at: "2026-09-15T00:00:00Z",
});
const pendingDataset = makeDataset({
  id: "pending",
  upload_status: "processing",
  created_at: "2026-09-19T00:00:00Z",
});

describe("data view hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getToken.mockResolvedValue("test-token");
    mocks.listDatasets.mockResolvedValue([
      olderDataset,
      pendingDataset,
      newestDataset,
    ]);
  });

  it("loads predictions for the newest completed dataset", async () => {
    const overview = makePredictionOverview();
    mocks.getPredictionOverview.mockResolvedValue(overview);
    const { result } = renderHook(() => usePredictions(2, 20));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mocks.getPredictionOverview).toHaveBeenCalledWith(
      "test-token",
      "newest",
      2,
      20,
    );
    expect(result.current.hasDataset).toBe(true);
    expect(result.current.overview).toEqual(overview);
  });

  it("returns an empty prediction state when no completed dataset exists", async () => {
    mocks.listDatasets.mockResolvedValue([pendingDataset]);
    const { result } = renderHook(() => usePredictions(1, 20));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.hasDataset).toBe(false);
    expect(result.current.overview).toBeNull();
    expect(mocks.getPredictionOverview).not.toHaveBeenCalled();
  });

  it("loads and switches dashboard datasets", async () => {
    const newestSummary = makeDashboardSummary();
    const olderSummary = makeDashboardSummary({ average_health_score: "77.00" });
    mocks.getDatasetDashboard
      .mockResolvedValueOnce(newestSummary)
      .mockResolvedValueOnce(olderSummary);
    const { result } = renderHook(() => useDashboard());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.datasets.map((dataset) => dataset.id)).toEqual([
      "newest",
      "older",
    ]);
    expect(result.current.selectedDatasetId).toBe("newest");

    act(() => result.current.selectDataset("older"));
    await waitFor(() => expect(result.current.summary).toEqual(olderSummary));
    expect(mocks.getDatasetDashboard).toHaveBeenLastCalledWith(
      "test-token",
      "older",
    );
  });

  it("passes recommendation filters and refreshes after a status update", async () => {
    const overview = makeRecommendationOverview();
    mocks.getRecommendationOverview.mockResolvedValue(overview);
    mocks.updateRecommendationStatus.mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useRecommendations(3, "in_progress", "CUST-001"),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mocks.getRecommendationOverview).toHaveBeenCalledWith(
      "test-token",
      "newest",
      3,
      10,
      "in_progress",
      "CUST-001",
    );

    await act(async () => {
      await result.current.setStatus("recommendation-1", "completed");
    });
    expect(mocks.updateRecommendationStatus).toHaveBeenCalledWith(
      "test-token",
      "recommendation-1",
      "completed",
    );
    expect(mocks.getRecommendationOverview).toHaveBeenCalledTimes(2);
  });

  it("loads simulation history and prepends a newly run simulation", async () => {
    const existing = makeSimulation({ id: "existing" });
    const created = makeSimulation({ id: "created" });
    mocks.listSimulations.mockResolvedValue([existing]);
    mocks.createSimulation.mockResolvedValue(created);
    const { result } = renderHook(() => useSimulations());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.datasets.map((dataset) => dataset.id)).toEqual([
      "newest",
      "older",
    ]);

    await act(async () => {
      await result.current.runSimulation({
        dataset_id: "newest",
        intervention_type: "discount",
        target_segment: "high-risk",
        intensity_percentage: 50,
      });
    });

    expect(result.current.result).toEqual(created);
    expect(result.current.simulations).toEqual([created, existing]);
    expect(result.current.isRunning).toBe(false);
  });

  it("surfaces failed simulation loading without stale data", async () => {
    mocks.listDatasets.mockRejectedValue(new Error("Backend unavailable"));
    mocks.listSimulations.mockResolvedValue([]);
    const { result } = renderHook(() => useSimulations());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe("Backend unavailable");
    expect(result.current.datasets).toEqual([]);
    expect(result.current.simulations).toEqual([]);
  });
});
