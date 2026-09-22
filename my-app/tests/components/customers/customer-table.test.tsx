import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CustomerTable } from "@/components/customers/customer-table";

const row = { id: "customer-1", customerName: "CUST-001", riskTier: "Critical" as const, healthScore: 18, churnProbability: 91.25, monthlyRevenue: 79.5, contractType: "Month-to-month", status: "Active" as const, lastActivity: null };

describe("CustomerTable", () => {
  it("renders values, detail navigation, and pagination", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<CustomerTable rows={[row]} page={1} pageSize={50} total={51} totalPages={2} deletingCustomerId={null} deleteError={null} onDeleteCustomer={vi.fn()} onPageChange={onPageChange} />);
    expect(screen.getByText("91.3%")).toBeInTheDocument();
    expect(screen.getByText("$79.50")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View CUST-001" })).toHaveAttribute("href", "/customers/customer-1");
    await user.click(screen.getByRole("button", { name: /Next/ }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("confirms customer deletion and closes on success", async () => {
    const user = userEvent.setup();
    const onDeleteCustomer = vi.fn().mockResolvedValue(true);
    render(<CustomerTable rows={[row]} page={1} pageSize={50} total={1} totalPages={1} deletingCustomerId={null} deleteError={null} onDeleteCustomer={onDeleteCustomer} onPageChange={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Delete CUST-001" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Delete customer" }));
    expect(onDeleteCustomer).toHaveBeenCalledWith("customer-1");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders null fields and the filtered empty state", () => {
    const { rerender } = render(<CustomerTable rows={[{ ...row, riskTier: null, healthScore: null, churnProbability: null, monthlyRevenue: null, contractType: null, status: "Unknown" }]} page={1} pageSize={50} total={1} totalPages={1} deletingCustomerId={null} deleteError={null} onDeleteCustomer={vi.fn()} onPageChange={vi.fn()} />);
    expect(screen.getAllByText("Not available").length).toBeGreaterThanOrEqual(4);
    rerender(<CustomerTable rows={[]} page={1} pageSize={50} total={0} totalPages={0} deletingCustomerId={null} deleteError={null} onDeleteCustomer={vi.fn()} onPageChange={vi.fn()} />);
    expect(screen.getByText("No customers match the current filters.")).toBeInTheDocument();
  });
});
