"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Database,
  Gauge,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomerDetail } from "@/hooks/use-customer-detail";
import type {
  RecommendationPriority,
  RecommendationStatus,
  RiskTier,
} from "@/types/api";

const riskStyles: Record<RiskTier, string> = {
  Critical: "border-red-300 bg-red-100 text-red-800",
  High: "border-red-200 bg-red-50 text-red-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  Low: "border-green-200 bg-green-50 text-green-700",
};

const priorityStyles: Record<RecommendationPriority, string> = {
  urgent: "border-red-300 bg-red-100 text-red-800",
  high: "border-red-200 bg-red-50 text-red-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-green-200 bg-green-50 text-green-700",
};

const statusLabels: Record<RecommendationStatus, string> = {
  new: "New",
  in_progress: "In progress",
  completed: "Completed",
};

function formatCurrency(value: string | null) {
  if (value === null) return "Not available";

  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function CustomerDetailLoadingState() {
  return (
    <div className="space-y-6" aria-label="Loading customer details">
      <Skeleton className="h-24 rounded-lg" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-lg" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Skeleton className="h-72 rounded-lg" />
        <Skeleton className="h-72 rounded-lg" />
      </div>
    </div>
  );
}

export default function CustomerDetailPage() {
  const params = useParams<{ customerId: string }>();
  const customerId = params.customerId;
  const { customerDetail, isLoading, error, refresh } =
    useCustomerDetail(customerId);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#FCFAF7] p-6 md:p-8 dark:bg-background">
        <CustomerDetailLoadingState />
      </main>
    );
  }

  if (error || !customerDetail) {
    return (
      <main className="min-h-screen bg-[#FCFAF7] p-6 md:p-8 dark:bg-background">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/customers">
            <ArrowLeft className="size-4" />
            Back to customers
          </Link>
        </Button>
        <Card className="border-red-200 bg-white shadow-none dark:bg-[#1F1A16]">
          <CardContent className="flex min-h-64 flex-col items-center justify-center gap-4 p-8 text-center">
            <AlertCircle className="size-8 text-red-700" />
            <div>
              <h1 className="text-xl font-semibold">Unable to load customer</h1>
              <p className="mt-2 text-muted-foreground">
                {error ?? "Customer details are not available."}
              </p>
            </div>
            <Button type="button" onClick={() => void refresh()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const { customer, prediction, recommendations } = customerDetail;
  const churnProbability = prediction
    ? `${(Number(prediction.churn_probability) * 100).toFixed(1)}%`
    : "Not available";

  const metrics = [
    { label: "Monthly revenue", value: formatCurrency(customer.monthly_revenue) },
    { label: "Total revenue", value: formatCurrency(customer.total_revenue) },
    { label: "Tenure", value: `${customer.tenure_months} months` },
    { label: "Contract", value: customer.contract_type ?? "Not available" },
  ];

  return (
    <main className="min-h-screen bg-[#FCFAF7] p-6 md:p-8 dark:bg-background">
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/customers">
          <ArrowLeft className="size-4" />
          Back to customers
        </Link>
      </Button>

      <header className="mb-8 flex flex-col gap-4 border-b border-[#D8D0C5] pb-6 sm:flex-row sm:items-end sm:justify-between dark:border-border">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Customer profile
          </p>
          <h1 className="mt-1 text-3xl font-bold md:text-4xl">
            {customer.customer_identifier}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Source: {customerDetail.dataset_name}
          </p>
        </div>
        {prediction && (
          <Badge
            variant="outline"
            className={`h-7 px-3 text-sm ${riskStyles[prediction.risk_tier]}`}
          >
            {prediction.risk_tier} risk
          </Badge>
        )}
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card
            key={metric.label}
            className="border-[#E7DED1] bg-white shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]"
          >
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="mt-2 text-2xl font-bold">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card className="border-[#E7DED1] bg-white shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <Gauge className="size-5" />
              Churn prediction
            </CardTitle>
          </CardHeader>
          <CardContent>
            {prediction ? (
              <dl className="divide-y divide-[#E7DED1] dark:divide-[#3A312A]">
                <div className="flex items-center justify-between gap-4 py-4">
                  <dt className="text-muted-foreground">Churn probability</dt>
                  <dd className="text-lg font-semibold">{churnProbability}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-4">
                  <dt className="text-muted-foreground">Health score</dt>
                  <dd className="text-lg font-semibold">
                    {prediction.health_score}/100
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-4">
                  <dt className="text-muted-foreground">Model version</dt>
                  <dd className="font-medium">{prediction.model_version}</dd>
                </div>
              </dl>
            ) : (
              <div className="flex min-h-48 flex-col items-center justify-center text-center">
                <Gauge className="size-7 text-muted-foreground" />
                <p className="mt-3 font-semibold">Prediction not available</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  This customer does not have a completed churn prediction.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#E7DED1] bg-white shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Retention recommendations ({recommendations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recommendations.length > 0 ? (
              <div className="divide-y divide-[#E7DED1] dark:divide-[#3A312A]">
                {recommendations.map((recommendation) => (
                  <article key={recommendation.id} className="py-5 first:pt-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="font-semibold">{recommendation.action}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {recommendation.expected_impact ??
                            "Expected impact not available"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={priorityStyles[recommendation.priority]}
                        >
                          {recommendation.priority}
                        </Badge>
                        <Badge variant="secondary">
                          {statusLabels[recommendation.status]}
                        </Badge>
                      </div>
                    </div>
                    {recommendation.top_drivers.length > 0 && (
                      <p className="mt-3 text-sm text-muted-foreground">
                        Leading driver: {recommendation.top_drivers[0].feature}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className="flex min-h-48 flex-col items-center justify-center text-center">
                <AlertCircle className="size-7 text-muted-foreground" />
                <p className="mt-3 font-semibold">No recommendations available</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  No retention actions have been generated for this customer.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 border-t border-[#D8D0C5] py-4 dark:border-border">
          <Database className="size-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">{customerDetail.dataset_filename}</p>
            <p className="text-xs text-muted-foreground">Original dataset file</p>
          </div>
        </div>
        <div className="flex items-center gap-3 border-t border-[#D8D0C5] py-4 dark:border-border">
          <CalendarDays className="size-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              {new Date(customer.created_at).toLocaleDateString()}
            </p>
            <p className="text-xs text-muted-foreground">Customer record created</p>
          </div>
        </div>
      </section>
    </main>
  );
}
