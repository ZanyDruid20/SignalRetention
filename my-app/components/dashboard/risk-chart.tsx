"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RevenueByRiskTier } from "@/types/api";

export function RevenueAtRiskChart({ data }: { data: RevenueByRiskTier[] }) {
  const chartData = data.map((item) => ({ ...item, monthly_revenue: Number(item.monthly_revenue) }));
  return (
    <Card className="border-[#E7DED1] bg-white shadow-none dark:border-border dark:bg-card">
      <CardHeader><CardTitle>Revenue Exposure</CardTitle>
        <p className="text-sm text-muted-foreground">Monthly revenue grouped by predicted risk tier</p></CardHeader>
      <CardContent><div className="h-72 min-h-72 min-w-0">
        <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}>
          <CartesianGrid vertical={false} strokeDasharray="4 4" />
          <XAxis dataKey="risk_tier" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${Number(value) / 1000}k`} />
          <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, "Monthly revenue"]} cursor={{ fill: "var(--muted)" }} />
          <Bar dataKey="monthly_revenue" fill="var(--dashboard-risk-line)" radius={[4, 4, 0, 0]} />
        </BarChart></ResponsiveContainer>
      </div></CardContent>
    </Card>
  );
}
