"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertCircle, Database, LineChart } from "lucide-react";

import { HighRiskCustomersTable } from "@/components/predictions/high-risk-table";
import { PredictionStats } from "@/components/predictions/prediction-stats";
import { RiskDistributionChart } from "@/components/predictions/risk-distribution-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePredictions } from "@/hooks/use-predictions";

const PAGE_SIZE = 20;

function PredictionsLoadingState() {
  return (
    <div className="mt-8 space-y-8" aria-label="Loading predictions">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-[430px] rounded-lg" />
      <Skeleton className="h-96 rounded-lg" />
    </div>
  );
}

export default function PredictionsPage() {
  const [page, setPage] = useState(1);
  const { overview, isLoading, error, hasDataset, refresh } = usePredictions(
    page,
    PAGE_SIZE
  );
  const predictionCount =
    overview?.risk_distribution.reduce((sum, item) => sum + item.count, 0) ?? 0;

  return (
    <div className="min-h-screen bg-[#FCFAF7] p-8 dark:bg-background">
      <header>
        <h1 className="text-4xl font-bold">Predictions</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Monitor churn predictions and identify customers at risk
        </p>
      </header>

      {isLoading ? (
        <PredictionsLoadingState />
      ) : error ? (
        <Card className="mt-8 border-red-200 bg-white shadow-none dark:bg-[#1F1A16]">
          <CardContent className="flex min-h-64 flex-col items-center justify-center gap-4 p-8 text-center">
            <AlertCircle className="size-8 text-red-700" />
            <div>
              <h2 className="text-xl font-semibold">Unable to load predictions</h2>
              <p className="mt-2 text-muted-foreground">{error}</p>
            </div>
            <Button type="button" onClick={() => void refresh()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : !hasDataset ? (
        <Card className="mt-8 border-[#E7DED1] bg-white shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]">
          <CardContent className="flex min-h-64 flex-col items-center justify-center gap-4 p-8 text-center">
            <Database className="size-8 text-muted-foreground" />
            <div>
              <h2 className="text-xl font-semibold">No processed dataset yet</h2>
              <p className="mt-2 text-muted-foreground">
                Upload a customer CSV to generate churn predictions.
              </p>
            </div>
            <Button asChild>
              <Link href="/datasets">Upload dataset</Link>
            </Button>
          </CardContent>
        </Card>
      ) : !overview || predictionCount === 0 ? (
        <Card className="mt-8 border-[#E7DED1] bg-white shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]">
          <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
            <LineChart className="size-8 text-muted-foreground" />
            <div>
              <h2 className="text-xl font-semibold">Predictions not available</h2>
              <p className="mt-2 text-muted-foreground">
                The selected dataset does not contain prediction results.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <main className="mt-8 space-y-8">
          <PredictionStats summary={overview.summary} />
          <RiskDistributionChart distribution={overview.risk_distribution} />
          <HighRiskCustomersTable
            customers={overview.high_risk_customers.items}
            page={overview.high_risk_customers.page}
            pageSize={overview.high_risk_customers.page_size}
            total={overview.high_risk_customers.total}
            totalPages={overview.high_risk_customers.total_pages}
            onPageChange={setPage}
          />
        </main>
      )}
    </div>
  );
}
