import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import PredictionsPage from "@/app/predictions/page";
import { makePredictionOverview } from "@/tests/fixtures/factories";

const mocks = vi.hoisted(() => ({ refresh: vi.fn(), usePredictions: vi.fn() }));

vi.mock("@/hooks/use-predictions", () => ({
  usePredictions: mocks.usePredictions,
}));
vi.mock("@/components/predictions/risk-distribution-chart", () => ({
  RiskDistributionChart: () => <div>Risk distribution chart</div>,
}));

describe("PredictionsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.usePredictions.mockReturnValue({
      overview: null,
      isLoading: false,
      error: null,
      hasDataset: false,
      refresh: mocks.refresh,
    });
  });

  it("renders a labeled loading state", () => {
    mocks.usePredictions.mockReturnValue({
      overview: null,
      isLoading: true,
      error: null,
      hasDataset: false,
      refresh: mocks.refresh,
    });
    render(<PredictionsPage />);
    expect(screen.getByLabelText("Loading predictions")).toBeInTheDocument();
  });

  it("shows request errors and retries", async () => {
    const user = userEvent.setup();
    mocks.usePredictions.mockReturnValue({
      overview: null,
      isLoading: false,
      error: "Backend unavailable",
      hasDataset: true,
      refresh: mocks.refresh,
    });
    render(<PredictionsPage />);
    expect(screen.getByText("Backend unavailable")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });

  it("directs new users to upload a dataset", () => {
    render(<PredictionsPage />);
    expect(screen.getByText("No processed dataset yet")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Upload dataset" })).toHaveAttribute(
      "href",
      "/datasets",
    );
  });

  it("distinguishes a processed dataset with no predictions", () => {
    const overview = makePredictionOverview({
      risk_distribution: [
        { risk_tier: "Critical", count: 0 },
        { risk_tier: "High", count: 0 },
        { risk_tier: "Medium", count: 0 },
        { risk_tier: "Low", count: 0 },
      ],
    });
    mocks.usePredictions.mockReturnValue({
      overview,
      isLoading: false,
      error: null,
      hasDataset: true,
      refresh: mocks.refresh,
    });
    render(<PredictionsPage />);
    expect(screen.getByText("Predictions not available")).toBeInTheDocument();
  });

  it("renders summary, chart, and high-risk results", () => {
    mocks.usePredictions.mockReturnValue({
      overview: makePredictionOverview(),
      isLoading: false,
      error: null,
      hasDataset: true,
      refresh: mocks.refresh,
    });
    render(<PredictionsPage />);
    expect(screen.getByText("Risk distribution chart")).toBeInTheDocument();
    expect(screen.getByText("CUST-001")).toBeInTheDocument();
    expect(screen.getByText("High-Risk Customers")).toBeInTheDocument();
  });
});
