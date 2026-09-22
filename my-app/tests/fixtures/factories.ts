import type {
  CustomerExplorerPage,
  CustomerRead,
  DashboardSummary,
  DatasetRead,
  PredictionOverview,
  RecommendationOverview,
  RecommendationOverviewItem,
  SimulationRead,
  UserRead,
} from "@/types/api";

let sequence = 0;

function nextId(prefix: string) {
  sequence += 1;
  return `${prefix}-${sequence}`;
}

export function makeUser(overrides: Partial<UserRead> = {}): UserRead {
  return {
    id: nextId("user"),
    clerk_user_id: nextId("clerk"),
    email: "tester@example.com",
    name: "Test User",
    created_at: "2026-09-01T12:00:00Z",
    updated_at: "2026-09-01T12:00:00Z",
    ...overrides,
  };
}

export function makeDataset(overrides: Partial<DatasetRead> = {}): DatasetRead {
  const id = nextId("dataset");
  return {
    id,
    user_id: "user-1",
    name: `${id}.csv`,
    filename: `${id}.csv`,
    record_count: 7043,
    upload_status: "completed",
    created_at: "2026-09-10T12:00:00Z",
    ...overrides,
  };
}

export function makeCustomer(overrides: Partial<CustomerRead> = {}): CustomerRead {
  return {
    id: nextId("customer"),
    dataset_id: "dataset-1",
    customer_identifier: "CUST-001",
    tenure_months: 12,
    monthly_revenue: "79.50",
    total_revenue: "954.00",
    contract_type: "Month-to-month",
    actual_churn: false,
    created_at: "2026-09-10T12:00:00Z",
    ...overrides,
  };
}

export function makeCustomerExplorerPage(
  overrides: Partial<CustomerExplorerPage> = {},
): CustomerExplorerPage {
  return {
    items: [
      {
        id: "customer-1",
        customer_identifier: "CUST-001",
        monthly_revenue: "79.50",
        contract_type: "Month-to-month",
        actual_churn: false,
        risk_tier: "Critical",
        health_score: 18,
        churn_probability: "0.9100",
      },
    ],
    summary: {
      total_customers: 1,
      high_risk_customers: 1,
      monthly_revenue_at_risk: "79.50",
      average_health_score: "18.00",
    },
    page: 1,
    page_size: 50,
    total: 1,
    total_pages: 1,
    ...overrides,
  };
}

export function makePredictionOverview(
  overrides: Partial<PredictionOverview> = {},
): PredictionOverview {
  return {
    summary: {
      critical_count: 1,
      high_count: 0,
      average_churn_probability: "0.9100",
      monthly_revenue_at_risk: "79.50",
    },
    risk_distribution: [
      { risk_tier: "Critical", count: 1 },
      { risk_tier: "High", count: 0 },
      { risk_tier: "Medium", count: 0 },
      { risk_tier: "Low", count: 0 },
    ],
    high_risk_customers: {
      items: [
        {
          customer_id: "customer-1",
          customer_identifier: "CUST-001",
          risk_tier: "Critical",
          churn_probability: "0.9100",
          monthly_revenue: "79.50",
          recommended_action: "Schedule retention call",
        },
      ],
      page: 1,
      page_size: 20,
      total: 1,
      total_pages: 1,
    },
    ...overrides,
  };
}

export function makeRecommendation(
  overrides: Partial<RecommendationOverviewItem> = {},
): RecommendationOverviewItem {
  return {
    id: nextId("recommendation"),
    customer_id: "customer-1",
    customer_identifier: "CUST-001",
    action: "Schedule retention call",
    priority: "urgent",
    expected_impact: "Reduce churn risk",
    top_drivers: [{ feature: "Contract", impact: 0.42 }],
    status: "new",
    monthly_revenue: "79.50",
    churn_probability: "0.9100",
    risk_tier: "Critical",
    completed_at: null,
    created_at: "2026-09-10T12:00:00Z",
    ...overrides,
  };
}

export function makeRecommendationOverview(
  overrides: Partial<RecommendationOverview> = {},
): RecommendationOverview {
  return {
    summary: {
      total_recommendations: 1,
      high_priority_count: 1,
      monthly_revenue_at_risk: "79.50",
      completion_rate: "0.0000",
    },
    recommendations: {
      items: [makeRecommendation()],
      page: 1,
      page_size: 10,
      total: 1,
    },
    ...overrides,
  };
}

export function makeDashboardSummary(
  overrides: Partial<DashboardSummary> = {},
): DashboardSummary {
  return {
    churn_metrics: {
      total_customers: 1,
      predicted_churners: 1,
      average_churn_probability: "0.9100",
    },
    revenue_metrics: {
      monthly_revenue_at_risk: "79.50",
      estimated_revenue_saved: null,
    },
    average_health_score: "18.00",
    risk_tier_counts: [{ risk_tier: "Critical", count: 1 }],
    health_score_distribution: [{ category: "Critical", count: 1 }],
    revenue_by_risk_tier: [
      { risk_tier: "Critical", monthly_revenue: "79.50" },
    ],
    high_risk_customers: [
      {
        customer_id: "customer-1",
        customer_identifier: "CUST-001",
        health_score: 18,
        monthly_revenue: "79.50",
        risk_tier: "Critical",
        churn_probability: "0.9100",
      },
    ],
    ...overrides,
  };
}

export function makeSimulation(overrides: Partial<SimulationRead> = {}): SimulationRead {
  return {
    id: nextId("simulation"),
    user_id: "user-1",
    dataset_id: "dataset-1",
    intervention_type: "discount",
    target_segment: "high-risk",
    intensity_percentage: 50,
    targeted_customers: 10,
    estimated_customers_retained: 3,
    predicted_churn_reduction: "0.1500",
    estimated_revenue_saved: "1200.00",
    estimated_cost: "400.00",
    roi: "3.0000",
    created_at: "2026-09-10T12:00:00Z",
    ...overrides,
  };
}
