import {
  DollarSign,
  TrendingDown,
  Activity,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  trend: "up" | "down";
}

function StatCard({
  title,
  value,
  change,
  icon,
  trend,
}: StatCardProps) {
  const TrendIcon =
    trend === "up" ? ArrowUpRight : ArrowDownRight;

  return (
    <Card
      className="
        rounded-3xl
        border-[#E7DED1]
        bg-white
        shadow-none
      "
    >
      <CardContent className="p-3">

        {/* Header */}
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-medium text-muted-foreground">
            {title}
          </h3>

          <div
            className="
              flex h-9 w-9
              items-center justify-center
              rounded-xl
              bg-[#F3EEE6]
            "
          >
            {icon}
          </div>
        </div>

        {/* Value */}
        <div className="mt-4">
          <h2 className="text-3xl font-bold tracking-tight">
            {value}
          </h2>
        </div>

        {/* Trend */}
        <div className="mt-3 flex items-center gap-3">
          <div
            className="
              flex items-center gap-1
              rounded-lg
              bg-green-50
              px-2.5 py-1
              text-sm font-medium
              text-green-700
            "
          >
            <TrendIcon className="h-3.5 w-3.5" />
            {change > 0 ? "+" : ""}
            {change}%
          </div>

          <span className="text-sm text-muted-foreground">
            from last month
          </span>
        </div>

      </CardContent>
    </Card>
  );
}

export function StatCards() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <StatCard
        title="Revenue at Risk"
        value="$284,500"
        change={-12.4}
        trend="down"
        icon={<DollarSign className="h-5 w-5" />}
      />

      <StatCard
        title="Churn Rate"
        value="4.2%"
        change={-0.8}
        trend="down"
        icon={<TrendingDown className="h-5 w-5" />}
      />

      <StatCard
        title="Avg. Health Score"
        value="72.8"
        change={3.2}
        trend="up"
        icon={<Activity className="h-5 w-5" />}
      />

      <StatCard
        title="Active Customers"
        value="2,847"
        change={5.1}
        trend="up"
        icon={<Users className="h-5 w-5" />}
      />
    </div>
  );
}