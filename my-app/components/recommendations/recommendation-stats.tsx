import { Card } from "@/components/ui/card";
import { CheckCircle2, Target, TrendingUp, Zap } from "lucide-react";
import { mockRecommendations } from "./recommendation-data";

type RecommendationStatsProps = {
  completedCount: number;
};

export function RecommendationStats({ completedCount }: RecommendationStatsProps) {
  const totalRecommendations = mockRecommendations.length;

  const highPriority = mockRecommendations.filter(
    (recommendation) => recommendation.priority === "High"
  ).length;

  const totalRevenue = mockRecommendations.reduce(
    (sum, recommendation) =>
      sum + parseInt(recommendation.revenueSaved.replace(/[$,]/g, "")),
    0
  );

  const completionRate = Math.round(
    (completedCount / totalRecommendations) * 100
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="border border-[#E7DED1] bg-card p-6 shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Recommendations
            </p>
            <p className="mt-2 text-2xl font-bold">{totalRecommendations}</p>
          </div>
          <Target className="h-8 w-8 text-muted-foreground opacity-20" />
        </div>
      </Card>

      <Card className="border border-[#E7DED1] bg-card p-6 shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              High Priority
            </p>
            <p className="mt-2 text-2xl font-bold">{highPriority}</p>
          </div>
          <Zap className="h-8 w-8 text-amber-600 opacity-20" />
        </div>
      </Card>

      <Card className="border border-[#E7DED1] bg-card p-6 shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Revenue Impact
            </p>
            <p className="mt-2 text-2xl font-bold">
              ${(totalRevenue / 1000).toFixed(0)}K
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-green-600 opacity-20" />
        </div>
      </Card>

      <Card className="border border-[#E7DED1] bg-card p-6 shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </p>
            <p className="mt-2 text-2xl font-bold">{completionRate}%</p>
          </div>
          <CheckCircle2 className="h-8 w-8 text-green-600 opacity-20" />
        </div>
      </Card>
    </div>
  );
}
