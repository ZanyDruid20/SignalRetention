"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const riskData = [
  { risk: "Critical", customers: 18 },
  { risk: "High", customers: 42 },
  { risk: "Medium", customers: 87 },
  { risk: "Low", customers: 124 },
];

export function RiskDistributionChart() {
  return (
    <Card className="border-[#E7DED1] bg-white shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Risk Distribution
        </CardTitle>

        <p className="text-muted-foreground">
          Customer distribution by churn risk level
        </p>
      </CardHeader>

      <CardContent>
        <div className="h-87.5">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={riskData}
              layout="vertical"
              margin={{
                top: 10,
                right: 20,
                left: 20,
                bottom: 10,
              }}
            >
              <CartesianGrid
                strokeDasharray="4 4"
                horizontal={true}
                vertical={false}
                stroke="var(--dashboard-chart-grid)"
              />

              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 14,
                  fill: "var(--dashboard-chart-muted)",
                }}
              />

              <YAxis
                dataKey="risk"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 14,
                  fill: "var(--dashboard-chart-muted)",
                }}
                width={80}
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
                radius={[0, 10, 10, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
