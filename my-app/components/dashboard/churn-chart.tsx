"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RiskTierCount } from "@/types/api";

export function ChurnChart({ data }: { data: RiskTierCount[] }) {
  return (
    <Card className="border-[#E7DED1] bg-white shadow-none dark:border-border dark:bg-card">
      <CardHeader><CardTitle>Churn Risk Distribution</CardTitle>
        <p className="text-sm text-muted-foreground">Customers grouped by predicted risk tier</p></CardHeader>
      <CardContent><div className="h-72 min-h-72 min-w-0">
        <ResponsiveContainer width="100%" height="100%"><BarChart data={data}>
          <CartesianGrid vertical={false} strokeDasharray="4 4" />
          <XAxis dataKey="risk_tier" axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: "var(--muted)" }} />
          <Bar dataKey="count" name="Customers" fill="var(--dashboard-churn-line)" radius={[4, 4, 0, 0]} />
        </BarChart></ResponsiveContainer>
      </div></CardContent>
    </Card>
  );
}
