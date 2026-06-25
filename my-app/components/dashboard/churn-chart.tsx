"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type TrendData = {
  month: string;
  value: number;
};

type TrendChartProps = {
  data: TrendData[];
  color: string;
  fill: string;
  domain: [number, number];
};

const churnData: TrendData[] = [
  { month: "Jan", value: 5.2 },
  { month: "Feb", value: 4.8 },
  { month: "Mar", value: 5.1 },
  { month: "Apr", value: 4.6 },
  { month: "May", value: 4.3 },
  { month: "Jun", value: 4.2 },
];

const retentionData: TrendData[] = [
  { month: "Jan", value: 87 },
  { month: "Feb", value: 84 },
  { month: "Mar", value: 81 },
  { month: "Apr", value: 85 },
  { month: "May", value: 89 },
  { month: "Jun", value: 94 },
];

function TrendChart({
  data,
  color,
  fill,
  domain,
}: TrendChartProps) {
  return (
    <div className="h-62.5">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
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
            tickFormatter={(value) => `${value}%`}
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "var(--dashboard-chart-muted)",
              fontSize: 14,
            }}
          />

          <Tooltip
            formatter={(value) => [`${value}%`]}
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
          />

          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill={fill}
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ChurnChart() {
  return (
    <Card className="border-[#E7DED1] bg-white shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Churn Trend
        </CardTitle>

        <p className="text-muted-foreground">
          Monthly churn rate over time
        </p>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="churn">
          <TabsList className="mb-6 rounded-xl bg-[#F3EEE6] dark:bg-[#2B241F]">
            <TabsTrigger
              value="churn"
              className="dark:data-active:bg-[#251F1B] dark:data-active:text-white"
            >
              Churn Rate
            </TabsTrigger>

            <TabsTrigger
              value="retention"
              className="dark:data-active:bg-[#251F1B] dark:data-active:text-white"
            >
              Retention
            </TabsTrigger>
          </TabsList>

          <TabsContent value="churn">
            <TrendChart
              data={churnData}
              color="var(--dashboard-churn-line)"
              fill="var(--dashboard-churn-fill)"
              domain={[0, 8]}
            />
          </TabsContent>

          <TabsContent value="retention">
            <TrendChart
              data={retentionData}
              color="var(--dashboard-retention-line)"
              fill="var(--dashboard-retention-fill)"
              domain={[80, 100]}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
