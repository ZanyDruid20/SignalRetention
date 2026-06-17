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
          <CartesianGrid strokeDasharray="4 4" />

          <XAxis dataKey="month" />

          <YAxis
            domain={domain}
            tickFormatter={(value) => `${value}%`}
          />

          <Tooltip
            formatter={(value) => [`${value}%`]}
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
    <Card className="border-[#E7DED1]">
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
          <TabsList className="mb-6">
            <TabsTrigger value="churn">
              Churn Rate
            </TabsTrigger>

            <TabsTrigger value="retention">
              Retention
            </TabsTrigger>
          </TabsList>

          <TabsContent value="churn">
            <TrendChart
              data={churnData}
              color="#A53D13"
              fill="#F4E4DC"
              domain={[0, 8]}
            />
          </TabsContent>

          <TabsContent value="retention">
            <TrendChart
              data={retentionData}
              color="#1E6B3B"
              fill="#DFF0E6"
              domain={[80, 100]}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}