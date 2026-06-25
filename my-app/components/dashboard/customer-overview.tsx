"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Customer = {
  initials: string;
  name: string;
  company: string;
  healthScore: number;
  mrr: string;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  lastActivity: string;
};

const customers: Customer[] = [
  {
    initials: "SC",
    name: "Sarah Chen",
    company: "Acme Corp",
    healthScore: 85,
    mrr: "$12,500",
    riskLevel: "Low",
    lastActivity: "2 hours ago",
  },
  {
    initials: "MJ",
    name: "Marcus Johnson",
    company: "TechFlow Inc",
    healthScore: 42,
    mrr: "$8,900",
    riskLevel: "High",
    lastActivity: "5 days ago",
  },
  {
    initials: "ER",
    name: "Emily Rodriguez",
    company: "StartupXYZ",
    healthScore: 68,
    mrr: "$5,200",
    riskLevel: "Medium",
    lastActivity: "1 day ago",
  },
  {
    initials: "DK",
    name: "David Kim",
    company: "Enterprise Co",
    healthScore: 23,
    mrr: "$45,000",
    riskLevel: "Critical",
    lastActivity: "2 weeks ago",
  },
  {
    initials: "LT",
    name: "Lisa Thompson",
    company: "GrowthLab",
    healthScore: 91,
    mrr: "$7,800",
    riskLevel: "Low",
    lastActivity: "4 hours ago",
  },
  {
    initials: "JW",
    name: "James Wilson",
    company: "Digital First",
    healthScore: 56,
    mrr: "$15,600",
    riskLevel: "Medium",
    lastActivity: "3 days ago",
  },
  {
    initials: "AP",
    name: "Anna Petrov",
    company: "ScaleUp",
    healthScore: 34,
    mrr: "$22,000",
    riskLevel: "High",
    lastActivity: "1 week ago",
  },
  {
    initials: "MB",
    name: "Michael Brown",
    company: "CloudTech",
    healthScore: 78,
    mrr: "$9,500",
    riskLevel: "Low",
    lastActivity: "6 hours ago",
  },
];

function RiskBadge({
  risk,
}: {
  risk: Customer["riskLevel"];
}) {
  const styles = {
    Low: "bg-green-50 text-green-700 border-green-200",
    Medium: "bg-orange-50 text-orange-700 border-orange-200",
    High: "bg-red-50 text-red-700 border-red-200",
    Critical: "bg-red-100 text-red-800 border-red-300",
  };

  return (
    <span
      className={`rounded-full border px-4 py-1 text-sm font-medium ${styles[risk]}`}
    >
      {risk}
    </span>
  );
}

function HealthBar({
  score,
}: {
  score: number;
}) {
  const color =
    score >= 80
      ? "bg-green-700"
      : score >= 60
      ? "bg-[#5A3B26]"
      : "bg-[#A53D13]";

  return (
    <div className="flex items-center gap-3">
      <div className="h-3 w-32 rounded-full bg-[#E7DED1] dark:bg-muted">
        <div
          className={`h-3 rounded-full ${color}`}
          style={{
            width: `${score}%`,
          }}
        />
      </div>

      <span className="font-semibold">
        {score}
      </span>
    </div>
  );
}

export function CustomerOverview() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const pageSize = 5;

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      customer.company
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(
    filteredCustomers.length / pageSize
  );

  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  const pageCustomers =
    filteredCustomers.slice(start, end);

  return (
    <Card className="border-[#E7DED1] bg-white dark:border-border dark:bg-card">
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-3xl font-bold">
              Customer Overview
            </CardTitle>

            <p className="mt-2 text-lg text-muted-foreground">
              Monitor customer health and engagement metrics
            </p>
          </div>

          <div className="flex gap-3">
            <div className="relative w-70">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                placeholder="Search customers..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="pl-10"
              />
            </div>

            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="overflow-hidden">
        <div className="w-full overflow-hidden">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b">
                <th className="pb-4 text-left text-lg">
                  Customer
                </th>

                <th className="pb-4 text-left text-lg">
                  Health Score
                </th>

                <th className="pb-4 text-left text-lg">
                  MRR
                </th>

                <th className="pb-4 text-left text-lg">
                  Risk Level
                </th>

                <th className="pb-4 text-left text-lg">
                  Last Activity
                </th>

                <th />
              </tr>
            </thead>

            <tbody>
              {pageCustomers.map((customer) => (
                <tr
                  key={customer.name}
                  className="border-b transition-colors hover:bg-[#F8F5F0] dark:border-border dark:hover:bg-muted/40"
                >
                  <td className="py-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border bg-[#F8F5F0] text-lg font-medium dark:border-border dark:bg-muted">
                        {customer.initials}
                      </div>

                      <div>
                        <p className="font-semibold">
                          {customer.name}
                        </p>

                        <p className="text-muted-foreground">
                          {customer.company}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td>
                    <HealthBar
                      score={customer.healthScore}
                    />
                  </td>

                  <td className="font-semibold">
                    {customer.mrr}
                  </td>

                  <td>
                    <RiskBadge
                      risk={customer.riskLevel}
                    />
                  </td>

                  <td className="text-muted-foreground">
                    {customer.lastActivity}
                  </td>

                  <td>
                    <MoreHorizontal className="h-5 w-5 cursor-pointer text-muted-foreground hover:text-foreground" />
                  </td>
                </tr>
              ))}

              {pageCustomers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-muted-foreground"
                  >
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-muted-foreground">
            Showing{" "}
            {filteredCustomers.length === 0
              ? 0
              : start + 1}
            {" "}to{" "}
            {Math.min(
              end,
              filteredCustomers.length
            )}{" "}
            of {filteredCustomers.length} customers
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 1}
              onClick={() =>
                setPage(page - 1)
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({
              length: totalPages,
            }).map((_, index) => (
              <Button
                key={index}
                variant={
                  page === index + 1
                    ? "default"
                    : "outline"
                }
                onClick={() =>
                  setPage(index + 1)
                }
              >
                {index + 1}
              </Button>
            ))}

            <Button
              variant="outline"
              size="icon"
              disabled={
                page === totalPages ||
                totalPages === 0
              }
              onClick={() =>
                setPage(page + 1)
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
