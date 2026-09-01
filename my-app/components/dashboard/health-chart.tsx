"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HealthScoreBucket } from "@/types/api";

export function HealthDistributionChart({ data }: { data: HealthScoreBucket[] }) {
  return (
    <Card className="border-[#E7DED1] bg-white shadow-none dark:border-border dark:bg-card">
      <CardHeader><CardTitle>Health Score Distribution</CardTitle>
        <p className="text-sm text-muted-foreground">Customer counts across health score ranges</p></CardHeader>
      <CardContent><div className="h-80 min-h-80 min-w-0">
        <ResponsiveContainer width="100%" height="100%"><BarChart data={data}>
          <CartesianGrid vertical={false} strokeDasharray="4 4" />
          <XAxis dataKey="category" axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: "var(--muted)" }} />
          <Bar dataKey="count" name="Customers" fill="var(--dashboard-health-bar)" radius={[4, 4, 0, 0]} />
        </BarChart></ResponsiveContainer>
      </div></CardContent>
    </Card>
  );
}
