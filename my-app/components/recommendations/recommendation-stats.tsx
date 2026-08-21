import { Card } from "@/components/ui/card";
import type { RecommendationOverviewSummary } from "@/types/api";
import { CheckCircle2, Target, TrendingUp, Zap } from "lucide-react";

function formatCurrency(value: string) {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function RecommendationStats({
  summary,
}: {
  summary: RecommendationOverviewSummary;
}) {
  const stats = [
    {
      label: "Total Recommendations",
      value: summary.total_recommendations.toLocaleString(),
      icon: Target,
      iconClass: "text-muted-foreground",
    },
    {
      label: "Urgent & High Priority",
      value: summary.high_priority_count.toLocaleString(),
      icon: Zap,
      iconClass: "text-amber-600",
    },
    {
      label: "Monthly Revenue at Risk",
      value: formatCurrency(summary.monthly_revenue_at_risk),
      icon: TrendingUp,
      iconClass: "text-green-600",
    },
    {
      label: "Completion Rate",
      value: `${Math.round(Number(summary.completion_rate) * 100)}%`,
      icon: CheckCircle2,
      iconClass: "text-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, iconClass }) => (
        <Card
          key={label}
          className="border border-[#E7DED1] bg-card p-6 shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              <p className="mt-2 text-2xl font-bold">{value}</p>
            </div>
            <Icon className={`size-8 shrink-0 opacity-30 ${iconClass}`} />
          </div>
        </Card>
      ))}
    </div>
  );
}
