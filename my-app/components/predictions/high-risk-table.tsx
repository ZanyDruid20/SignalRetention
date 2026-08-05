"use client";

import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { HighRiskPredictionCustomer } from "@/types/api";

type HighRiskCustomersTableProps = {
  customers: HighRiskPredictionCustomer[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function RiskBadge({ risk }: { risk: "Critical" | "High" }) {
  const styles = {
    Critical: "border-red-300 bg-red-100 text-red-800",
    High: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${styles[risk]}`}
    >
      {risk === "High" ? "High Risk" : risk}
    </span>
  );
}

function formatProbability(value: string) {
  return `${(Number(value) * 100).toFixed(1)}%`;
}

function formatRevenue(value: string | null) {
  if (value === null) return "Not available";

  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export function HighRiskCustomersTable({
  customers,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
}: HighRiskCustomersTableProps) {
  const firstItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, total);

  return (
    <Card className="border-[#E7DED1] bg-white shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-5 text-[#A53D13]" />
          <CardTitle className="text-2xl font-bold">High-Risk Customers</CardTitle>
        </div>
        <p className="text-muted-foreground">
          Customers with the highest predicted churn probability
        </p>
      </CardHeader>

      <CardContent>
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-190">
            <thead>
              <tr className="border-b text-left text-muted-foreground dark:border-[#3A312A]">
                <th className="px-4 pb-4 font-semibold">Customer</th>
                <th className="px-4 pb-4 font-semibold">Risk Tier</th>
                <th className="px-4 pb-4 font-semibold">Churn Probability</th>
                <th className="px-4 pb-4 font-semibold">Monthly Revenue</th>
                <th className="px-4 pb-4 font-semibold">Recommended Action</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((customer) => (
                <tr
                  key={customer.customer_id}
                  className="border-b transition-colors hover:bg-[#F8F5F0] dark:border-[#3A312A] dark:hover:bg-muted/40"
                >
                  <td className="px-4 py-5 font-semibold">
                    {customer.customer_identifier}
                  </td>
                  <td className="px-4 py-5">
                    <RiskBadge risk={customer.risk_tier} />
                  </td>
                  <td className="px-4 py-5 font-semibold text-[#A53D13]">
                    {formatProbability(customer.churn_probability)}
                  </td>
                  <td className="px-4 py-5 font-semibold">
                    {formatRevenue(customer.monthly_revenue)}
                  </td>
                  <td className="px-4 py-5">
                    {customer.recommended_action ?? "Not available"}
                  </td>
                </tr>
              ))}

              {customers.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    No high-risk customers were found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {firstItem.toLocaleString()}-{lastItem.toLocaleString()} of{" "}
            {total.toLocaleString()}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <span className="min-w-24 text-center text-sm font-medium">
              Page {totalPages === 0 ? 0 : page} of {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
