import { AlertTriangle } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type RiskTier = "Critical" | "High Risk";

type HighRiskCustomer = {
  name: string;
  company: string;
  riskTier: RiskTier;
  churnProbability: number;
  mrr: string;
  recommendedAction: string;
};

const highRiskCustomers: HighRiskCustomer[] = [
  {
    name: "David Kim",
    company: "Enterprise Co",
    riskTier: "Critical",
    churnProbability: 89,
    mrr: "$45,000",
    recommendedAction: "Immediate Outreach",
  },
  {
    name: "Anna Petrov",
    company: "ScaleUp",
    riskTier: "High Risk",
    churnProbability: 72,
    mrr: "$22,000",
    recommendedAction: "Discount Offer",
  },
  {
    name: "Marcus Johnson",
    company: "TechFlow",
    riskTier: "High Risk",
    churnProbability: 68,
    mrr: "$8,900",
    recommendedAction: "Schedule Call",
  },
];

function RiskBadge({ risk }: { risk: RiskTier }) {
  const styles = {
    Critical: "bg-red-100 text-red-800 border-red-300",
    "High Risk": "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`rounded-full border px-4 py-1 text-sm font-medium ${styles[risk]}`}
    >
      {risk}
    </span>
  );
}

export function HighRiskCustomersTable() {
  return (
    <Card className="border-[#E7DED1]">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-[#A53D13]" />

          <CardTitle className="text-2xl font-bold">
            High-Risk Customers
          </CardTitle>
        </div>

        <p className="text-muted-foreground">
          Customers with the highest predicted churn probability
        </p>
      </CardHeader>

      <CardContent className="overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-225">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-4 pb-4 text-lg font-semibold">Customer</th>
                <th className="px-4 pb-4 text-lg font-semibold">Company</th>
                <th className="px-4 pb-4 text-lg font-semibold">Risk Tier</th>
                <th className="px-4 pb-4 text-lg font-semibold">
                  Churn Probability
                </th>
                <th className="px-4 pb-4 text-lg font-semibold">MRR</th>
                <th className="px-4 pb-4 text-lg font-semibold">
                  Recommended Action
                </th>
              </tr>
            </thead>

            <tbody>
              {highRiskCustomers.map((customer) => (
                <tr
                  key={customer.name}
                  className="border-b transition-colors hover:bg-[#F8F5F0]"
                >
                  <td className="px-4 py-5 font-semibold">{customer.name}</td>

                  <td className="px-4 py-5 text-muted-foreground">
                    {customer.company}
                  </td>

                  <td className="px-4 py-5">
                    <RiskBadge risk={customer.riskTier} />
                  </td>

                  <td className="px-4 py-5 font-semibold text-[#A53D13]">
                    {customer.churnProbability}%
                  </td>

                  <td className="px-4 py-5 font-semibold">{customer.mrr}</td>

                  <td className="px-4 py-5">
                    <span className="rounded-full bg-[#F1ECE4] px-4 py-1 text-sm font-medium text-[#5A3B26]">
                      {customer.recommendedAction}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}