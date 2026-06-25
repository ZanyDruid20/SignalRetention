"use client";

import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type RiskTier = "Critical" | "High Risk" | "Moderate" | "Low";
type Status = "Active" | "Inactive";

type Customer = {
  initials: string;
  name: string;
  company: string;
  riskTier: RiskTier;
  health: number;
  churnProbability: number;
  mrr: string;
  contract: "Monthly" | "Annual" | "Enterprise";
  lastActivity: string;
  status: Status;
};

const customers: Customer[] = [
  { initials: "DK", name: "David Kim", company: "Enterprise Co", riskTier: "Critical", health: 23, churnProbability: 89, mrr: "$45,000", contract: "Enterprise", lastActivity: "2 weeks ago", status: "Inactive" },
  { initials: "RG", name: "Rachel Green", company: "Innovate Labs", riskTier: "Critical", health: 29, churnProbability: 81, mrr: "$18,500", contract: "Annual", lastActivity: "10 days ago", status: "Inactive" },
  { initials: "AP", name: "Anna Petrov", company: "ScaleUp", riskTier: "High Risk", health: 34, churnProbability: 72, mrr: "$22,000", contract: "Enterprise", lastActivity: "1 week ago", status: "Active" },
  { initials: "MJ", name: "Marcus Johnson", company: "TechFlow Inc", riskTier: "High Risk", health: 42, churnProbability: 68, mrr: "$8,900", contract: "Annual", lastActivity: "5 days ago", status: "Active" },
  { initials: "JW", name: "James Wilson", company: "Digital First", riskTier: "Moderate", health: 56, churnProbability: 45, mrr: "$15,600", contract: "Annual", lastActivity: "3 days ago", status: "Active" },
  { initials: "TA", name: "Tom Anderson", company: "FastGrowth", riskTier: "Moderate", health: 62, churnProbability: 38, mrr: "$6,200", contract: "Monthly", lastActivity: "2 days ago", status: "Active" },
  { initials: "ER", name: "Emily Rodriguez", company: "StartupXYZ", riskTier: "Low", health: 68, churnProbability: 29, mrr: "$5,200", contract: "Monthly", lastActivity: "1 day ago", status: "Active" },
  { initials: "MB", name: "Michael Brown", company: "CloudTech", riskTier: "Low", health: 78, churnProbability: 18, mrr: "$9,500", contract: "Annual", lastActivity: "6 hours ago", status: "Active" },
  { initials: "SC", name: "Sarah Chen", company: "Acme Corp", riskTier: "Low", health: 85, churnProbability: 12, mrr: "$12,500", contract: "Enterprise", lastActivity: "2 hours ago", status: "Active" },
  { initials: "LT", name: "Lisa Thompson", company: "GrowthLab", riskTier: "Low", health: 91, churnProbability: 8, mrr: "$7,800", contract: "Annual", lastActivity: "4 hours ago", status: "Active" },
];

function RiskBadge({ risk }: { risk: RiskTier }) {
  const styles = {
    Critical: "bg-red-100 text-red-800 border-red-300",
    "High Risk": "bg-red-50 text-red-700 border-red-200",
    Moderate: "bg-orange-50 text-orange-700 border-orange-200",
    Low: "bg-green-50 text-green-700 border-green-200",
  };

  return (
    <span className={`rounded-full border px-4 py-1 text-sm font-medium ${styles[risk]}`}>
      {risk}
    </span>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const styles = {
    Active: "bg-green-50 text-green-700 border-green-200",
    Inactive: "bg-orange-50 text-orange-700 border-orange-200",
  };

  return (
    <span className={`rounded-full border px-4 py-1 text-sm font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

type CustomerTableProps = {
  search: string;
  riskTiers: string[];
  contract: string;
  revenueRange: string;
  healthScore: number[];
};

function getMonthlyRevenue(mrr: string) {
  return Number(mrr.replace(/[^0-9]/g, ""));
}

function matchesRevenueRange(mrr: string, revenueRange: string) {
  const revenue = getMonthlyRevenue(mrr);

  if (revenueRange === "low") {
    return revenue <= 10000;
  }

  if (revenueRange === "medium") {
    return revenue > 10000 && revenue <= 25000;
  }

  if (revenueRange === "high") {
    return revenue > 25000;
  }

  return true;
}

export function CustomerTable({
  search,
  riskTiers,
  contract,
  revenueRange,
  healthScore,
}: CustomerTableProps) {
  const normalizedSearch = search.trim().toLowerCase();
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(normalizedSearch) ||
      customer.company.toLowerCase().includes(normalizedSearch) ||
      customer.riskTier.toLowerCase().includes(normalizedSearch) ||
      customer.contract.toLowerCase().includes(normalizedSearch) ||
      customer.status.toLowerCase().includes(normalizedSearch);

    const matchesRisk =
      riskTiers.length === 0 || riskTiers.includes(customer.riskTier);

    const matchesContract =
      contract === "all" || customer.contract.toLowerCase() === contract;

    const matchesRevenue = matchesRevenueRange(customer.mrr, revenueRange);

    const matchesHealth =
      customer.health >= healthScore[0] && customer.health <= healthScore[1];

    return (
      matchesSearch &&
      matchesRisk &&
      matchesContract &&
      matchesRevenue &&
      matchesHealth
    );
  });

  return (
    <Card className="border-[#E7DED1] bg-white shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Customers ({filteredCustomers.length})</CardTitle>
      </CardHeader>

      <CardContent className="overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-[#D8CFC4] text-left text-muted-foreground dark:border-[#3A312A]">
                <th className="px-4 pb-4 text-lg font-semibold">Customer ↑↓</th>
                <th className="px-4 pb-4 text-lg font-semibold">Risk Tier ↑↓</th>
                <th className="px-4 pb-4 text-lg font-semibold">Health ↑</th>
                <th className="px-4 pb-4 text-lg font-semibold">Churn Prob. ↑↓</th>
                <th className="px-4 pb-4 text-lg font-semibold">MRR ↑↓</th>
                <th className="px-4 pb-4 text-lg font-semibold">Contract</th>
                <th className="px-4 pb-4 text-lg font-semibold">Last Activity</th>
                <th className="px-4 pb-4 text-lg font-semibold">Status</th>
                <th className="px-4 pb-4" />
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.name} className="border-b border-[#D8CFC4] transition-colors hover:bg-[#F8F5F0] dark:border-[#3A312A] dark:hover:bg-muted/40">
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border bg-[#F1ECE4] font-medium dark:border-[#3A312A] dark:bg-muted">
                        {customer.initials}
                      </div>

                      <div>
                        <p className="font-semibold">{customer.name}</p>
                        <p className="text-muted-foreground">{customer.company}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-5">
                    <RiskBadge risk={customer.riskTier} />
                  </td>

                  <td className="px-4 py-5 font-semibold text-[#A53D13]">
                    {customer.health}
                  </td>

                  <td className="px-4 py-5 font-semibold text-[#A53D13]">
                    {customer.churnProbability}%
                  </td>

                  <td className="px-4 py-5 font-semibold">
                    {customer.mrr}
                  </td>

                  <td className="px-4 py-5 text-muted-foreground">
                    {customer.contract}
                  </td>

                  <td className="px-4 py-5 text-muted-foreground">
                    {customer.lastActivity}
                  </td>

                  <td className="px-4 py-5">
                    <StatusBadge status={customer.status} />
                  </td>

                  <td className="px-4 py-5">
                    <Button variant="ghost" size="icon">
                      <ExternalLink className="h-5 w-5" />
                    </Button>
                  </td>
                </tr>
              ))}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    No customers match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
