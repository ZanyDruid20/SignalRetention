import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { HighRiskCustomersTable } from "@/components/predictions/high-risk-table";
import { RecommendationQueue } from "@/components/recommendations/recommendation-queue";
import { makeRecommendation } from "@/tests/fixtures/factories";

describe("HighRiskCustomersTable", () => {
  it("formats customer data and moves to the next page", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <HighRiskCustomersTable
        customers={[
          {
            customer_id: "customer-1",
            customer_identifier: "CUST-001",
            risk_tier: "Critical",
            churn_probability: "0.933",
            monthly_revenue: "90.75",
            recommended_action: "Schedule a retention call",
          },
        ]}
        page={1}
        pageSize={10}
        total={11}
        totalPages={2}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByText("93.3%")).toBeInTheDocument();
    expect(screen.getByText("$90.75")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Previous/ })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: /Next/ }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("renders a useful empty state", () => {
    render(
      <HighRiskCustomersTable
        customers={[]}
        page={1}
        pageSize={10}
        total={0}
        totalPages={0}
        onPageChange={vi.fn()}
      />,
    );
    expect(screen.getByText("No high-risk customers were found.")).toBeInTheDocument();
    expect(screen.getByText("Page 0 of 0")).toBeInTheDocument();
  });
});

describe("RecommendationQueue", () => {
  const baseProps = {
    page: 1,
    pageSize: 10,
    total: 1,
    statusFilter: "all" as const,
    search: "",
    updatingId: null,
    onStatusFilterChange: vi.fn(),
    onSearchChange: vi.fn(),
    onStatusChange: vi.fn().mockResolvedValue(undefined),
    onPageChange: vi.fn(),
  };

  it("supports search, filtering, and new-to-in-progress transitions", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    const onStatusFilterChange = vi.fn();
    const onStatusChange = vi.fn().mockResolvedValue(undefined);
    const item = makeRecommendation({ id: "rec-1", status: "new" });
    render(
      <RecommendationQueue
        {...baseProps}
        items={[item]}
        onSearchChange={onSearchChange}
        onStatusFilterChange={onStatusFilterChange}
        onStatusChange={onStatusChange}
      />,
    );

    await user.type(
      screen.getByRole("searchbox", { name: "Search recommendations by customer" }),
      "CUST",
    );
    expect(onSearchChange).toHaveBeenLastCalledWith("T");
    await user.click(screen.getByRole("button", { name: "Completed" }));
    expect(onStatusFilterChange).toHaveBeenCalledWith("completed");
    await user.click(screen.getByRole("button", { name: "Start" }));
    expect(onStatusChange).toHaveBeenCalledWith("rec-1", "in_progress");
  });

  it.each([
    ["in_progress", "Complete", "completed"],
    ["completed", "Reopen", "in_progress"],
  ] as const)("moves %s recommendations using %s", async (status, label, nextStatus) => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn().mockResolvedValue(undefined);
    render(
      <RecommendationQueue
        {...baseProps}
        items={[makeRecommendation({ id: "rec-status", status })]}
        onStatusChange={onStatusChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: label }));
    expect(onStatusChange).toHaveBeenCalledWith("rec-status", nextStatus);
  });

  it("renders the filtered empty state", () => {
    render(<RecommendationQueue {...baseProps} items={[]} total={0} />);
    expect(
      screen.getByText("No recommendations match this status."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Next/ })).toBeDisabled();
  });
});
