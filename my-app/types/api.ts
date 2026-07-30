export type RiskTier = "Low" | "Medium" | "High" | "Critical";
export type RecommendationPriority = "urgent" | "high" | "medium" | "low";
export type RecommendationStatus = "New" | "In Progress" | "Completed";

export type UserRead = {
    id: string;
    clerk_user_id: string; 
    email: string;
    name: string;
    created_at: string;
    updated_at: string;
}

export type DatasetRead = {
    id: string;
    user_id: string;
    name: string;
    filename: string;
    record_count: number;
    upload_status: string;
    created_at: string;
}

export type CustomerRead = {
    id: string;
    dataset_id: string;
    customer_identifier: string;
    tenure_months: number;
    monthly_revenue: string | null;
    total_revenue: string | null;
    contract_type: string | null;
    actual_churn: boolean | null;
    created_at: string;
}

export type PredictionRead = {
    id: string;
    customer_id: string;
    churn_probability: string;
    risk_tier: RiskTier;
    health_score: number;
    model_version: string;
    created_at: string;
}

export type RecommendationRead = {
    id: string;
    customer_id: string;
    action: string;
    priority: RecommendationPriority;
    expected_impact: string | null;
    created_at: string;
}

export type RiskTierCount = {
    risk_tier: RiskTier;
    count: number;
};

export type ChurnMetrics = {
    total_customers: number;
    predicted_churners: number;
    average_churn_probability: string | null;
};

export type RevenueMetrics = {
    monthly_revenue_at_risk: string | null;
    estimated_revenue_saved: string | null;
};

export type DashboardSummary = {
    churn_metrics: ChurnMetrics;
    revenue_metrics: RevenueMetrics;
    risk_tier_counts: RiskTierCount[];
};

export type SimulationRead = {
    id: string;
    user_id: string;
    strategy_name: string;
    discount_percentage: string | null;
    predicted_churn_reduction: string | null;
    estimated_revenue_saved: string | null;
    created_at: string;
}
