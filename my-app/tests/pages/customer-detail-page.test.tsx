import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CustomerDetailPage from "@/app/customers/[customerId]/page";
import { makeCustomer, makeRecommendation } from "@/tests/fixtures/factories";

const mocks = vi.hoisted(() => ({ refresh: vi.fn(), useCustomerDetail: vi.fn() }));
vi.mock("next/navigation", () => ({ useParams: () => ({ customerId: "customer-1" }) }));
vi.mock("@/hooks/use-customer-detail", () => ({ useCustomerDetail: mocks.useCustomerDetail }));

describe("CustomerDetailPage", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("renders loading and retryable error states", async () => {
    mocks.useCustomerDetail.mockReturnValue({ customerDetail: null, isLoading: true, error: null, refresh: mocks.refresh });
    const { rerender } = render(<CustomerDetailPage />);
    expect(screen.getByLabelText("Loading customer details")).toBeInTheDocument();
    mocks.useCustomerDetail.mockReturnValue({ customerDetail: null, isLoading: false, error: "Customer not found", refresh: mocks.refresh });
    rerender(<CustomerDetailPage />);
    expect(screen.getByText("Customer not found")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(mocks.refresh).toHaveBeenCalled();
  });

  it("renders profile, prediction, and recommendations", () => {
    mocks.useCustomerDetail.mockReturnValue({ customerDetail: {
      customer: makeCustomer({ customer_identifier: "CUST-900", monthly_revenue: "90.75", total_revenue: "1089.00" }),
      dataset_name: "Telecom Demo", dataset_filename: "telecom.csv",
      prediction: { id: "prediction-1", customer_id: "customer-1", churn_probability: "0.933", risk_tier: "Critical", health_score: 18, model_version: "xgb-1", created_at: "2026-09-01T00:00:00Z" },
      recommendations: [makeRecommendation({ id: "rec-1", action: "Call customer" })],
    }, isLoading: false, error: null, refresh: mocks.refresh });
    render(<CustomerDetailPage />);
    expect(screen.getByRole("heading", { name: "CUST-900" })).toBeInTheDocument();
    expect(screen.getByText("93.3%")).toBeInTheDocument();
    expect(screen.getByText("Critical risk")).toBeInTheDocument();
    expect(screen.getByText("Call customer")).toBeInTheDocument();
    expect(screen.getByText("Leading driver: Contract")).toBeInTheDocument();
  });

  it("renders missing prediction and recommendation states", () => {
    mocks.useCustomerDetail.mockReturnValue({ customerDetail: { customer: makeCustomer(), dataset_name: "Demo", dataset_filename: "demo.csv", prediction: null, recommendations: [] }, isLoading: false, error: null, refresh: mocks.refresh });
    render(<CustomerDetailPage />);
    expect(screen.getByText("Prediction not available")).toBeInTheDocument();
    expect(screen.getByText("No recommendations available")).toBeInTheDocument();
  });
});
