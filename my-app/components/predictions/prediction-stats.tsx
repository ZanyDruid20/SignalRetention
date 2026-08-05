import { AlertTriangle, DollarSign, ShieldAlert, TrendingDown } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { PredictionOverviewSummary } from "@/types/api";

type PredictionStatsProps = {
  summary: PredictionOverviewSummary;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function PredictionStats({ summary }: PredictionStatsProps) {
  const averageProbability =
    summary.average_churn_probability === null
      ? null
      : Number(summary.average_churn_probability) * 100;

  const stats = [
    {
      label: "Critical Risk",
      value: summary.critical_count.toLocaleString(),
      icon: ShieldAlert,
      valueClassName: "text-red-700",
    },
    {
      label: "High Risk",
      value: summary.high_count.toLocaleString(),
      icon: AlertTriangle,
      valueClassName: "text-orange-700",
    },
    {
      label: "Avg Churn Probability",
      value:
        averageProbability === null
          ? "Not available"
          : `${averageProbability.toFixed(1)}%`,
      icon: TrendingDown,
      valueClassName: "",
    },
    {
      label: "Monthly Revenue at Risk",
      value: currencyFormatter.format(
        Number(summary.monthly_revenue_at_risk) || 0
      ),
      icon: DollarSign,
      valueClassName: "",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card
            key={stat.label}
            className="border-[#E7DED1] bg-white shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]"
          >
            <CardContent className="flex min-h-32 items-center justify-between gap-4 p-6">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`mt-2 truncate text-3xl font-bold ${stat.valueClassName}`}>
                  {stat.value}
                </p>
              </div>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#F1ECE4] text-[#5A3B26] dark:bg-muted dark:text-foreground">
                <Icon className="size-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
