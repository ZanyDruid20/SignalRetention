export type RiskTier = "Low" | "Medium" | "High" | "Critical";
export type RecommendationPriority = "urgent" | "high" | "medium" | "low";
export type RecommendationStatus = "new" | "in_progress" | "completed";
export type InterventionType = "discount" | "onboarding" | "training" | "support";
export type SimulationTargetSegment = "high-risk" | "medium-risk" | "low-risk";

export type ChurnDriver = {
    feature: string;
    impact: number;
}

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

export type CustomerDetail = {
    customer: CustomerRead;
    dataset_name: string;
    dataset_filename: string;
    prediction: PredictionRead | null;
    recommendations: RecommendationRead[];
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

export type CustomerExplorerItem = {
    id: string;
    customer_identifier: string;
    monthly_revenue: string | null;
    contract_type: string | null;
    actual_churn: boolean | null;
    risk_tier: RiskTier | null;
    health_score: number | null;
    churn_probability: string | null;
}

export type CustomerExplorerSummary = {
    total_customers: number;
    high_risk_customers: number;
    monthly_revenue_at_risk: string;
    average_health_score: string | null;
}

export type CustomerExplorerPage = {
    items: CustomerExplorerItem[];
    summary: CustomerExplorerSummary;
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
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

export type PredictionOverviewSummary = {
    critical_count: number;
    high_count: number;
    average_churn_probability: string | null;
    monthly_revenue_at_risk: string;
}

export type PredictionRiskDistributionItem = {
    risk_tier: RiskTier;
    count: number;
}

export type HighRiskPredictionCustomer = {
    customer_id: string;
    customer_identifier: string;
    risk_tier: Extract<RiskTier, "High" | "Critical">;
    churn_probability: string;
    monthly_revenue: string | null;
    recommended_action: string | null;
}

export type HighRiskPredictionPage = {
    items: HighRiskPredictionCustomer[];
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
}

export type PredictionOverview = {
    summary: PredictionOverviewSummary;
    risk_distribution: PredictionRiskDistributionItem[];
    high_risk_customers: HighRiskPredictionPage;
}

export type RecommendationRead = {
    id: string;
    customer_id: string;
    action: string;
    priority: RecommendationPriority;
    expected_impact: string | null;
    top_drivers: ChurnDriver[];
    status: RecommendationStatus;
    created_at: string;
    completed_at: string | null;
}

export type RecommendationOverviewSummary = {
    total_recommendations: number;
    high_priority_count: number;
    monthly_revenue_at_risk: string;
    completion_rate: string;
}

export type RecommendationOverviewItem = RecommendationRead & {
    customer_identifier: string;
    monthly_revenue: string | null;
    churn_probability: string | null;
    risk_tier: RiskTier | null;
}

export type RecommendationOverviewPage = {
    items: RecommendationOverviewItem[];
    page: number;
    page_size: number;
    total: number;
}

export type RecommendationOverview = {
    summary: RecommendationOverviewSummary;
    recommendations: RecommendationOverviewPage;
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

export type SimulationRequest = {
    dataset_id: string;
    intervention_type: InterventionType;
    target_segment: SimulationTargetSegment;
    intensity_percentage: number;
}

export type SimulationRead = SimulationRequest & {
    id: string;
    user_id: string;
    targeted_customers: number;
    estimated_customers_retained: number;
    predicted_churn_reduction: string;
    estimated_revenue_saved: string;
    estimated_cost: string;
    roi: string;
    created_at: string;
}
