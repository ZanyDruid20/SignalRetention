"use client";

import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type TrendData = {
  month: string;
  risk: number;
};

type TrendChartProps = {
  data: TrendData[];
  color: string;
  domain: [number, number];
};

const revenueAtRiskData: TrendData[] = [
  { month: "Jan", risk: 420000 },
  { month: "Feb", risk: 380000 },
  { month: "Mar", risk: 350000 },
  { month: "Apr", risk: 320000 },
  { month: "May", risk: 298000 },
  { month: "Jun", risk: 284500 },
];

function TrendChart({
  data,
  color,
  domain,
}: TrendChartProps) {
  return (
    <div className="h-62.5">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid
            stroke="var(--dashboard-chart-grid)"
            strokeDasharray="4 4"
          />

          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "var(--dashboard-chart-muted)",
              fontSize: 14,
            }}
          />

          <YAxis
            domain={domain}
            tickFormatter={(value) =>
              `$${value / 1000}k`
            }
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "var(--dashboard-chart-muted)",
              fontSize: 14,
            }}
          />

          <Tooltip
            formatter={(value) => [
              `$${Number(value).toLocaleString()}`,
              "Revenue at Risk",
            ]}
            contentStyle={{
              background: "var(--dashboard-chart-tooltip)",
              border: "1px solid var(--dashboard-chart-border)",
              borderRadius: "14px",
              color: "var(--dashboard-chart-text)",
            }}
            labelStyle={{
              color: "var(--dashboard-chart-text)",
              fontWeight: 700,
            }}
            itemStyle={{
              color,
            }}
          />

          <Line
            type="monotone"
            dataKey="risk"
            stroke={color}
            strokeWidth={4}
            dot={{
              r: 5,
              fill: color,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RevenueAtRiskChart() {
  return (
    <Card className="border-[#E7DED1] bg-white shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold">
          Revenue at Risk
        </CardTitle>

        <CardDescription>
          Monthly revenue exposure trend
        </CardDescription>
      </CardHeader>

      <CardContent>
        <TrendChart
          data={revenueAtRiskData}
          color="var(--dashboard-risk-line)"
          domain={[0, 500000]}
        />
      </CardContent>
    </Card>
  );
}
