import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CustomersPage from "@/app/customers/page";

const mocks = vi.hoisted(() => ({ refresh: vi.fn(), removeCustomer: vi.fn(), useCustomerExplorer: vi.fn() }));
vi.mock("@/hooks/use-customer-explorer", () => ({ useCustomerExplorer: mocks.useCustomerExplorer }));
vi.mock("@/components/customers/customer-header", () => ({ CustomerHeader: ({ onSearchChange }: { onSearchChange: (value: string) => void }) => <button onClick={() => onSearchChange("CUST-9")}>Search customer</button> }));
vi.mock("@/components/customers/customer-stats", () => ({ CustomerStats: () => <div>Customer stats</div> }));
vi.mock("@/components/customers/customer-filter", () => ({ CustomerFilters: ({ onRiskTiersChange, onContractChange, onRevenueRangeChange, onHealthScoreChange, onClearFilters }: { onRiskTiersChange: (value: string[]) => void; onContractChange: (value: string) => void; onRevenueRangeChange: (value: string) => void; onHealthScoreChange: (value: number[]) => void; onClearFilters: () => void }) => <div><button onClick={() => onRiskTiersChange(["Critical"])}>Risk filter</button><button onClick={() => onContractChange("one year")}>Contract filter</button><button onClick={() => onRevenueRangeChange("high")}>Revenue filter</button><button onClick={() => onHealthScoreChange([10, 90])}>Health filter</button><button onClick={onClearFilters}>Clear filters</button></div> }));
vi.mock("@/components/customers/customer-table", () => ({ CustomerTable: () => <div>Customer table</div> }));

function hookState(overrides = {}) {
  return { rows: [], summary: null, total: 0, totalPages: 0, isLoading: false, error: null, deletingCustomerId: null, deleteError: null, hasDataset: true, removeCustomer: mocks.removeCustomer, refresh: mocks.refresh, ...overrides };
}

describe("CustomersPage", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.useCustomerExplorer.mockReturnValue(hookState()); });

  it("renders loading, error retry, and no-dataset onboarding", async () => {
    mocks.useCustomerExplorer.mockReturnValueOnce(hookState({ isLoading: true }));
    const { rerender } = render(<CustomersPage />);
    expect(screen.getByLabelText("Loading customers")).toBeInTheDocument();
    mocks.useCustomerExplorer.mockReturnValue(hookState({ error: "API unavailable" }));
    rerender(<CustomersPage />);
    expect(screen.getByText("API unavailable")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(mocks.refresh).toHaveBeenCalled();
    mocks.useCustomerExplorer.mockReturnValue(hookState({ hasDataset: false }));
    rerender(<CustomersPage />);
    expect(screen.getByText("No processed dataset yet")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Upload dataset" })).toHaveAttribute("href", "/datasets");
  });

  it("distinguishes an empty processed dataset", () => {
    mocks.useCustomerExplorer.mockReturnValue(hookState({ summary: { totalCustomers: 0, highRiskCustomers: 0, monthlyRevenueAtRisk: 0, averageHealthScore: null } }));
    render(<CustomersPage />);
    expect(screen.getByText("Dataset contains no customers")).toBeInTheDocument();
  });

  it("renders populated explorer and sends search and filter values to the hook", async () => {
    const user = userEvent.setup();
    mocks.useCustomerExplorer.mockReturnValue(hookState({ rows: [{ id: "customer-1" }], total: 1, totalPages: 1, summary: { totalCustomers: 1, highRiskCustomers: 1, monthlyRevenueAtRisk: 80, averageHealthScore: 20 } }));
    render(<CustomersPage />);
    expect(screen.getByText("Customer stats")).toBeInTheDocument();
    expect(screen.getByText("Customer table")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Search customer" }));
    await user.click(screen.getByRole("button", { name: "Risk filter" }));
    await user.click(screen.getByRole("button", { name: "Contract filter" }));
    await user.click(screen.getByRole("button", { name: "Revenue filter" }));
    await user.click(screen.getByRole("button", { name: "Health filter" }));

    const latestFilters = mocks.useCustomerExplorer.mock.calls.at(-1)?.[0];
    expect(latestFilters).toEqual(expect.objectContaining({
      search: "CUST-9",
      riskTiers: ["Critical"],
      contractType: "One year",
      minRevenue: 90,
      minHealth: 10,
      maxHealth: 90,
    }));
  });

  it("clears all active filters", async () => {
    const user = userEvent.setup();
    mocks.useCustomerExplorer.mockReturnValue(hookState({ rows: [{}], total: 1, totalPages: 1, summary: { totalCustomers: 1, highRiskCustomers: 0, monthlyRevenueAtRisk: 0, averageHealthScore: 80 } }));
    render(<CustomersPage />);
    await user.click(screen.getByRole("button", { name: "Risk filter" }));
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    const latestFilters = mocks.useCustomerExplorer.mock.calls.at(-1)?.[0];
    expect(latestFilters).toEqual(expect.objectContaining({ riskTiers: [], contractType: undefined, minHealth: undefined, maxHealth: undefined }));
  });
});
