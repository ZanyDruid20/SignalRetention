"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { AlertCircle, Database } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerHeader } from "@/components/customers/customer-header";
import { CustomerStats } from "@/components/customers/customer-stats";
import { CustomerFilters } from "@/components/customers/customer-filter";
import { CustomerTable } from "@/components/customers/customer-table";
import { useCustomerExplorer } from "@/hooks/use-customer-explorer";
import type { RiskTier } from "@/types/api";

const PAGE_SIZE = 50;

function getRevenueBounds(range: string) {
  if (range === "low") return { maxRevenue: 50 };
  if (range === "medium") return { minRevenue: 50, maxRevenue: 90 };
  if (range === "high") return { minRevenue: 90 };
  return {};
}

function getContractType(contract: string) {
  const values: Record<string, string> = {
    "month-to-month": "Month-to-month",
    "one year": "One year",
    "two year": "Two year",
  };
  return values[contract];
}

function CustomerLoadingState() {
  return (
    <div className="space-y-8" aria-label="Loading customers">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-lg" />
      <Skeleton className="h-96 rounded-lg" />
    </div>
  );
}

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [riskTiers, setRiskTiers] = useState<RiskTier[]>([]);
  const [contract, setContract] = useState("all");
  const [revenueRange, setRevenueRange] = useState("all");
  const [healthScore, setHealthScore] = useState([0, 100]);
  const [page, setPage] = useState(1);

  const explorerFilters = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      search: deferredSearch,
      riskTiers,
      contractType: getContractType(contract),
      minHealth: healthScore[0] === 0 ? undefined : healthScore[0],
      maxHealth: healthScore[1] === 100 ? undefined : healthScore[1],
      ...getRevenueBounds(revenueRange),
    }),
    [contract, deferredSearch, healthScore, page, revenueRange, riskTiers]
  );

  const {
    rows,
    summary,
    total,
    totalPages,
    isLoading,
    error,
    hasDataset,
    refresh,
  } = useCustomerExplorer(explorerFilters);

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-[#F5F1EA] dark:bg-background">
      <header className="border-b border-[#D8D0C5] bg-[#FBFAF7] px-12 py-6 dark:border-border dark:bg-background">
        <CustomerHeader search={search} onSearchChange={updateSearch} />
      </header>

      <main className="space-y-8 px-12 py-8">
        {isLoading ? (
          <CustomerLoadingState />
        ) : error ? (
          <Card className="border-red-200 bg-white shadow-none dark:bg-[#1F1A16]">
            <CardContent className="flex min-h-64 flex-col items-center justify-center gap-4 p-8 text-center">
              <AlertCircle className="size-8 text-red-700" />
              <div>
                <h2 className="text-xl font-semibold">Unable to load customers</h2>
                <p className="mt-2 text-muted-foreground">{error}</p>
              </div>
              <Button type="button" onClick={() => void refresh()}>
                Try again
              </Button>
            </CardContent>
          </Card>
        ) : !hasDataset ? (
          <Card className="border-[#E7DED1] bg-white shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]">
            <CardContent className="flex min-h-64 flex-col items-center justify-center gap-4 p-8 text-center">
              <Database className="size-8 text-muted-foreground" />
              <div>
                <h2 className="text-xl font-semibold">No processed dataset yet</h2>
                <p className="mt-2 text-muted-foreground">
                  Upload a customer CSV to populate the explorer.
                </p>
              </div>
              <Button asChild>
                <Link href="/datasets">Upload dataset</Link>
              </Button>
            </CardContent>
          </Card>
        ) : summary?.totalCustomers === 0 ? (
          <Card className="border-[#E7DED1] bg-white shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]">
            <CardContent className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
              <h2 className="text-xl font-semibold">Dataset contains no customers</h2>
              <p className="mt-2 text-muted-foreground">
                Choose another processed dataset or upload a new CSV.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <CustomerStats summary={summary!} />
            <CustomerFilters
              riskTiers={riskTiers}
              onRiskTiersChange={(values) => {
                setRiskTiers(values);
                setPage(1);
              }}
              contract={contract}
              onContractChange={(value) => {
                setContract(value);
                setPage(1);
              }}
              revenueRange={revenueRange}
              onRevenueRangeChange={(value) => {
                setRevenueRange(value);
                setPage(1);
              }}
              healthScore={healthScore}
              onHealthScoreChange={(value) => {
                setHealthScore(value);
                setPage(1);
              }}
              onClearFilters={() => {
                setRiskTiers([]);
                setContract("all");
                setRevenueRange("all");
                setHealthScore([0, 100]);
                setPage(1);
              }}
            />
            <CustomerTable
              rows={rows}
              page={page}
              pageSize={PAGE_SIZE}
              total={total}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </main>
    </div>
  );
}
