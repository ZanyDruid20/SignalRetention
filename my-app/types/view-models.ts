import type { RecommendationPriority, RecommendationStatus, RiskTier } from "./api";

export type CustomerStatus = "Active" | "Inactive" | "Unknown";

export type CustomerExplorerRow = {
  id: string;
  customerName: string;
  riskTier: RiskTier;
  healthScore: number | null;
  churnProbability: number | null;
  monthlyRevenue: number | null;
  contractType: string | null;
  status: CustomerStatus;
  lastActivity: string | null;
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
  strategyName: string;
  interventionIntensity: number | null;
  predictedChurnReduction: number | null;
  estimatedRevenueSaved: number | null;
  createdAt: string;
};
