import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "@/app/dashboard/page";
import { makeDashboardSummary, makeDataset } from "@/tests/fixtures/factories";

const mocks = vi.hoisted(() => ({ refresh: vi.fn(), useDashboard: vi.fn() }));
vi.mock("@/hooks/use-dashboard", () => ({ useDashboard: mocks.useDashboard }));
vi.mock("@/components/dashboard/app-sidebar", () => ({ AppSidebar: () => <aside>Sidebar</aside> }));
vi.mock("@/components/dashboard/dashboard-header", () => ({ DashboardHeader: ({ onRefresh }: { onRefresh: () => void }) => <button onClick={onRefresh}>Refresh dashboard</button> }));
vi.mock("@/components/dashboard/churn-chart", () => ({ ChurnChart: () => <div>Churn chart</div> }));
vi.mock("@/components/dashboard/risk-chart", () => ({ RevenueAtRiskChart: () => <div>Revenue chart</div> }));
vi.mock("@/components/dashboard/health-chart", () => ({ HealthDistributionChart: () => <div>Health chart</div> }));
vi.mock("@/components/dashboard/simulation", () => ({ ScenarioSimulator: () => <div>Scenario simulator</div> }));
vi.mock("@/components/ui/sidebar", () => ({ SidebarProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>, SidebarInset: ({ children }: { children: React.ReactNode }) => <>{children}</> }));

describe("DashboardPage", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("renders loading, no-dataset, and error states", async () => {
    mocks.useDashboard.mockReturnValue({ datasets: [], selectedDatasetId: "", summary: null, isLoading: true, error: null, selectDataset: vi.fn(), refresh: mocks.refresh });
    const { rerender } = render(<DashboardPage />);
    expect(document.querySelectorAll("[data-slot=skeleton]").length).toBeGreaterThan(0);
    mocks.useDashboard.mockReturnValue({ datasets: [], selectedDatasetId: "", summary: null, isLoading: false, error: null, selectDataset: vi.fn(), refresh: mocks.refresh });
    rerender(<DashboardPage />);
    expect(screen.getByText("No completed datasets yet")).toBeInTheDocument();
    mocks.useDashboard.mockReturnValue({ datasets: [], selectedDatasetId: "", summary: null, isLoading: false, error: "API unavailable", selectDataset: vi.fn(), refresh: mocks.refresh });
    rerender(<DashboardPage />);
    expect(screen.getByText("API unavailable")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(mocks.refresh).toHaveBeenCalled();
  });

  it("renders live metrics and high-risk customers", () => {
    mocks.useDashboard.mockReturnValue({ datasets: [makeDataset({ id: "dataset-1" })], selectedDatasetId: "dataset-1", summary: makeDashboardSummary(), isLoading: false, error: null, selectDataset: vi.fn(), refresh: mocks.refresh });
    render(<DashboardPage />);
    expect(screen.getByText("Monthly Revenue at Risk")).toBeInTheDocument();
    expect(screen.getByText("100.0%")).toBeInTheDocument();
    expect(screen.getByText("CUST-001")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View CUST-001" })).toHaveAttribute("href", "/customers/customer-1");
    expect(screen.getByText("Scenario simulator")).toBeInTheDocument();
  });
});
