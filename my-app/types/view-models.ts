import type {
  InterventionType,
  RecommendationPriority,
  RecommendationStatus,
  RiskTier,
  SimulationTargetSegment,
} from "./api";

export type CustomerStatus = "Active" | "Inactive" | "Unknown";

export type CustomerExplorerRow = {
  id: string;
  customerName: string;
  riskTier: RiskTier | null;
  healthScore: number | null;
  churnProbability: number | null;
  monthlyRevenue: number | null;
  contractType: string | null;
  status: CustomerStatus;
  lastActivity: string | null;
};

export type CustomerExplorerSummaryView = {
  totalCustomers: number;
  highRiskCustomers: number;
  monthlyRevenueAtRisk: number;
  averageHealthScore: number | null;
};

export type RecommendationView = {
  id: string;
  customerId: string;
  customerName: string;
  companyName: string | null;
  action: string;
  priority: RecommendationPriority;
  expectedImpact: string | null;
  riskTier: RiskTier | null;
  churnProbability: number | null;
  revenueImpact: number | null;
  status: RecommendationStatus;
  completedAt: string | null;
};

export type DashboardStatsView = {
  totalCustomers: number;
  predictedChurners: number;
  averageChurnProbability: number | null;
  monthlyRevenueAtRisk: number | null;
  estimatedRevenueSaved: number | null;
};

export type RiskDistributionItem = {
  riskTier: RiskTier;
  count: number;
};

export type HighRiskCustomerRow = {
  customerId: string;
  customerName: string;
  companyName: string | null;
  riskTier: Extract<RiskTier, "High" | "Critical">;
  churnProbability: number;
  monthlyRevenue: number | null;
  recommendedAction: string | null;
};

export type SimulationResultView = {
  id: string;
  datasetId: string;
  interventionType: InterventionType;
  targetSegment: SimulationTargetSegment;
  interventionIntensity: number;
  targetedCustomers: number;
  estimatedCustomersRetained: number;
  predictedChurnReduction: number;
  estimatedRevenueSaved: number;
  estimatedCost: number;
  roi: number;
  createdAt: string;
};
