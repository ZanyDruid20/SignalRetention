import { Activity, DollarSign, TrendingDown, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { DashboardSummary } from "@/types/api";

function formatCurrency(value: string | null): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

function StatCard({ title, value, icon, note }: {
  title: string;
  value: string;
  icon: React.ReactNode;
  note: string;
}) {
  return (
    <Card className="border-[#E7DED1] bg-white shadow-none dark:border-border dark:bg-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <h3 className="text-base font-medium text-muted-foreground">{title}</h3>
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#F3EEE6] dark:bg-muted">
            {icon}
          </div>
        </div>
        <p className="mt-5 text-3xl font-bold">{value}</p>
        <p className="mt-2 text-sm text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}

export function StatCards({ summary }: { summary: DashboardSummary }) {
  const { total_customers: total, predicted_churners: atRisk } = summary.churn_metrics;
  const atRiskRate = total === 0 ? 0 : (atRisk / total) * 100;

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Monthly Revenue at Risk"
        value={formatCurrency(summary.revenue_metrics.monthly_revenue_at_risk)}
        note="From High and Critical customers" icon={<DollarSign className="h-5 w-5" />} />
      <StatCard title="High-Risk Customers" value={`${atRiskRate.toFixed(1)}%`}
        note={`${atRisk.toLocaleString()} of ${total.toLocaleString()} customers`}
        icon={<TrendingDown className="h-5 w-5" />} />
      <StatCard title="Average Health Score"
        value={Number(summary.average_health_score ?? 0).toFixed(1)}
        note="Across predicted customers" icon={<Activity className="h-5 w-5" />} />
      <StatCard title="Total Customers" value={total.toLocaleString()}
        note="In the selected dataset" icon={<Users className="h-5 w-5" />} />
    </div>
  );
}
