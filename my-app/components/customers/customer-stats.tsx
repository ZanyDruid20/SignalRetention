import { Activity, AlertTriangle, DollarSign, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { CustomerExplorerSummaryView } from "@/types/view-models";

type CustomerStatsProps = {
  summary: CustomerExplorerSummaryView;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function CustomerStats({ summary }: CustomerStatsProps) {
  const stats = [
    {
      label: "Total Customers",
      value: summary.totalCustomers.toLocaleString(),
      icon: Users,
      iconClassName: "bg-[#F5ECE4] text-[#5A3B26]",
    },
    {
      label: "High Risk Customers",
      value: summary.highRiskCustomers.toLocaleString(),
      icon: AlertTriangle,
      iconClassName: "bg-[#FCEEE8] text-[#A53D13]",
    },
    {
      label: "Monthly Revenue at Risk",
      value: currencyFormatter.format(summary.monthlyRevenueAtRisk),
      icon: DollarSign,
      iconClassName: "bg-[#F5ECE4] text-[#A53D13]",
    },
    {
      label: "Average Health Score",
      value:
        summary.averageHealthScore === null
          ? "Not available"
          : summary.averageHealthScore.toFixed(1),
      icon: Activity,
      iconClassName: "bg-[#EAF3EA] text-green-700",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card
            key={stat.label}
            className="border-[#DED8CF] bg-[#FBFAF7] py-0 shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]"
          >
            <CardContent className="flex h-32 items-center gap-4 p-5">
              <div
                className={`flex size-12 shrink-0 items-center justify-center rounded-lg ${stat.iconClassName}`}
              >
                <Icon className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 truncate text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
