import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import RecommendationsPage from "@/app/recommendations/page";
import {
  makeDataset,
  makeRecommendationOverview,
} from "@/tests/fixtures/factories";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  setStatus: vi.fn(),
  useRecommendations: vi.fn(),
}));

vi.mock("@/hooks/use-recommendations", () => ({
  useRecommendations: mocks.useRecommendations,
}));

describe("RecommendationsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useRecommendations.mockReturnValue({
      dataset: null,
      overview: null,
      isLoading: false,
      updatingId: null,
      error: null,
      hasDataset: false,
      refresh: mocks.refresh,
      setStatus: mocks.setStatus,
    });
  });

  it("renders loading and no-dataset states", () => {
    mocks.useRecommendations.mockReturnValueOnce({
      dataset: null,
      overview: null,
      isLoading: true,
      updatingId: null,
      error: null,
      hasDataset: false,
      refresh: mocks.refresh,
      setStatus: mocks.setStatus,
    });
    const { rerender } = render(<RecommendationsPage />);
    expect(screen.getByLabelText("Loading recommendations")).toBeInTheDocument();

    mocks.useRecommendations.mockReturnValue({
      dataset: null,
      overview: null,
      isLoading: false,
      updatingId: null,
      error: null,
      hasDataset: false,
      refresh: mocks.refresh,
      setStatus: mocks.setStatus,
    });
    rerender(<RecommendationsPage />);
    expect(screen.getByText("No processed dataset yet")).toBeInTheDocument();
  });

  it("shows a safe error and retries", async () => {
    const user = userEvent.setup();
    mocks.useRecommendations.mockReturnValue({
      dataset: makeDataset(),
      overview: null,
      isLoading: false,
      updatingId: null,
      error: "Unable to reach the API",
      hasDataset: true,
      refresh: mocks.refresh,
      setStatus: mocks.setStatus,
    });
    render(<RecommendationsPage />);
    expect(screen.getByText("Unable to reach the API")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });

  it("renders the dataset name and recommendation queue", () => {
    mocks.useRecommendations.mockReturnValue({
      dataset: makeDataset({ name: "telecom-churn.csv" }),
      overview: makeRecommendationOverview(),
      isLoading: false,
      updatingId: null,
      error: null,
      hasDataset: true,
      refresh: mocks.refresh,
      setStatus: mocks.setStatus,
    });
    render(<RecommendationsPage />);
    expect(
      screen.getByText("Prioritized retention actions for telecom-churn.csv."),
    ).toBeInTheDocument();
    expect(screen.getByText("Recommendation Queue")).toBeInTheDocument();
    expect(screen.getAllByText("CUST-001").length).toBeGreaterThan(0);
  });

  it("shows an empty result for a processed dataset", () => {
    mocks.useRecommendations.mockReturnValue({
      dataset: makeDataset(),
      overview: makeRecommendationOverview({
        summary: {
          total_recommendations: 0,
          high_priority_count: 0,
          monthly_revenue_at_risk: "0",
          completion_rate: "0",
        },
        recommendations: { items: [], page: 1, page_size: 10, total: 0 },
      }),
      isLoading: false,
      updatingId: null,
      error: null,
      hasDataset: true,
      refresh: mocks.refresh,
      setStatus: mocks.setStatus,
    });
    render(<RecommendationsPage />);
    expect(screen.getByText("No recommendations available")).toBeInTheDocument();
  });
});
