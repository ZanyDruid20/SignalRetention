"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { AlertCircle, Database } from "lucide-react";

import { RecommendedActions } from "@/components/recommendations/recommended-actions";
import { RecommendationQueue } from "@/components/recommendations/recommendation-queue";
import { RecommendationStats } from "@/components/recommendations/recommendation-stats";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecommendations } from "@/hooks/use-recommendations";
import type { RecommendationStatus } from "@/types/api";

function LoadingState() {
  return (
    <div className="space-y-8" aria-label="Loading recommendations">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-lg" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-lg" />
        <Skeleton className="h-80 rounded-lg" />
      </div>
      <Skeleton className="h-96 rounded-lg" />
    </div>
  );
}

export default function RecommendationsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const [statusFilter, setStatusFilter] = useState<RecommendationStatus | "all">(
    "all"
  );
  const {
    dataset,
    overview,
    isLoading,
    updatingId,
    error,
    hasDataset,
    refresh,
    setStatus,
  } = useRecommendations(page, statusFilter, deferredSearch);

  return (
    <div className="min-h-screen bg-[#FCFAF7] p-8 dark:bg-background">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Recommendations</h1>
        <p className="mt-2 text-muted-foreground">
          {dataset
            ? `Prioritized retention actions for ${dataset.name}.`
            : "Prioritized retention actions based on predicted churn risk."}
        </p>
      </header>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <Card className="border-red-200 bg-white shadow-none dark:bg-[#1F1A16]">
          <CardContent className="flex min-h-64 flex-col items-center justify-center gap-4 p-8 text-center">
            <AlertCircle className="size-8 text-red-700" />
            <div>
              <h2 className="text-xl font-semibold">Unable to load recommendations</h2>
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
                Upload a customer CSV to generate retention recommendations.
              </p>
            </div>
            <Button asChild>
              <Link href="/datasets">Upload dataset</Link>
            </Button>
          </CardContent>
        </Card>
      ) : overview && overview.summary.total_recommendations > 0 ? (
        <main className="space-y-8">
          <RecommendationStats summary={overview.summary} />
          <RecommendedActions
            recommendations={overview.recommendations.items}
            updatingId={updatingId}
            onStatusChange={setStatus}
          />
          <RecommendationQueue
            items={overview.recommendations.items}
            page={overview.recommendations.page}
            pageSize={overview.recommendations.page_size}
            total={overview.recommendations.total}
            statusFilter={statusFilter}
            search={search}
            updatingId={updatingId}
            onStatusFilterChange={(status) => {
              setStatusFilter(status);
              setPage(1);
            }}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            onStatusChange={setStatus}
            onPageChange={setPage}
          />
        </main>
      ) : (
        <Card className="border-[#E7DED1] bg-white shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]">
          <CardContent className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
            <h2 className="text-xl font-semibold">No recommendations available</h2>
            <p className="mt-2 text-muted-foreground">
              This dataset has not generated any retention actions yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
