"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const healthDistributionData = [
  { category: "Critical", customers: 12 },
  { category: "At Risk", customers: 28 },
  { category: "Moderate", customers: 45 },
  { category: "Healthy", customers: 89 },
  { category: "Excellent", customers: 67 },
];

export function HealthDistributionChart() {
  return (
    <Card className="border-[#E7DED1] bg-white shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">
          Health Score Distribution
        </CardTitle>

        <p className="text-muted-foreground text-lg">
          Customer distribution by health score range
        </p>
      </CardHeader>

      <CardContent>
        <div className="h-100">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={healthDistributionData}
              margin={{
                top: 20,
                right: 20,
                left: 10,
                bottom: 10,
              }}
            >
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke="var(--dashboard-chart-grid)"
              />

              <XAxis
                dataKey="category"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 16,
                  fill: "var(--dashboard-chart-muted)",
                }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tick={{
                  fontSize: 16,
                  fill: "var(--dashboard-chart-muted)",
                }}
              />

              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid var(--dashboard-chart-border)",
                  background: "var(--dashboard-chart-tooltip)",
                  color: "var(--dashboard-chart-text)",
                }}
                labelStyle={{
                  color: "var(--dashboard-chart-text)",
                  fontWeight: 700,
                }}
                itemStyle={{
                  color: "var(--dashboard-risk-line)",
                }}
              />

              <Bar
                dataKey="customers"
                fill="var(--dashboard-health-bar)"
                radius={[10, 10, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
