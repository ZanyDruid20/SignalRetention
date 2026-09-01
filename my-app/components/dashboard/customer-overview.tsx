import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardCustomer, RiskTier } from "@/types/api";

const riskStyles: Record<RiskTier, string> = {
  Low: "border-green-200 bg-green-50 text-green-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  High: "border-orange-200 bg-orange-50 text-orange-700",
  Critical: "border-red-200 bg-red-50 text-red-700",
};

export function CustomerOverview({ customers }: { customers: DashboardCustomer[] }) {
  return (
    <Card className="border-[#E7DED1] bg-white shadow-none dark:border-border dark:bg-card">
      <CardHeader><CardTitle>Highest-Risk Customers</CardTitle>
        <p className="text-sm text-muted-foreground">The five customers requiring attention first</p></CardHeader>
      <CardContent className="overflow-x-auto">
        {customers.length === 0 ? <p className="py-10 text-center text-muted-foreground">No high-risk customers in this dataset.</p> :
          <table className="w-full min-w-175 text-left"><thead><tr className="border-b text-sm text-muted-foreground">
            <th className="pb-3 font-medium">Customer</th><th className="pb-3 font-medium">Risk</th>
            <th className="pb-3 font-medium">Probability</th><th className="pb-3 font-medium">Health</th>
            <th className="pb-3 font-medium">Monthly revenue</th><th className="pb-3" />
          </tr></thead><tbody>{customers.map((customer) => <tr key={customer.customer_id} className="border-b last:border-0">
            <td className="py-4 font-semibold">{customer.customer_identifier}</td>
            <td><span className={`rounded-full border px-3 py-1 text-sm ${riskStyles[customer.risk_tier]}`}>{customer.risk_tier}</span></td>
            <td>{(Number(customer.churn_probability) * 100).toFixed(1)}%</td><td>{customer.health_score}</td>
            <td>{customer.monthly_revenue === null ? "N/A" : `$${Number(customer.monthly_revenue).toLocaleString()}`}</td>
            <td className="text-right"><Button asChild variant="ghost" size="icon"><Link href={`/customers/${customer.customer_id}`} aria-label={`View ${customer.customer_identifier}`}><ArrowUpRight className="h-4 w-4" /></Link></Button></td>
          </tr>)}</tbody></table>}
      </CardContent>
    </Card>
  );
}
