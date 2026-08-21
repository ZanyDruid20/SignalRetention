import Link from "next/link";
import { CheckCircle2, ExternalLink, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { RecommendationOverviewItem, RecommendationStatus } from "@/types/api";

const priorityStyles = {
  urgent: "border-red-300 bg-red-100 text-red-800",
  high: "border-red-200 bg-red-50 text-red-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-green-200 bg-green-50 text-green-700",
};

function formatPriority(priority: RecommendationOverviewItem["priority"]) {
  return priority === "urgent"
    ? "Urgent"
    : `${priority.charAt(0).toUpperCase()}${priority.slice(1)}`;
}

function formatCurrency(value: string | null) {
  if (value === null) return "Not available";
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

type RecommendedActionsProps = {
  recommendations: RecommendationOverviewItem[];
  updatingId: string | null;
  onStatusChange: (id: string, status: RecommendationStatus) => Promise<void>;
};

export function RecommendedActions({
  recommendations,
  updatingId,
  onStatusChange,
}: RecommendedActionsProps) {
  const activeRecommendations = recommendations
    .filter((item) => item.status !== "completed")
    .slice(0, 4);

  if (activeRecommendations.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold">Recommended Actions</h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {activeRecommendations.map((recommendation) => {
          const isUpdating = updatingId === recommendation.id;
          const primaryDriver = recommendation.top_drivers[0];

          return (
            <Card
              key={recommendation.id}
              className="border border-[#E7DED1] bg-card p-6 shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">
                      {recommendation.customer_identifier}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {recommendation.risk_tier ?? "Risk unavailable"}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={priorityStyles[recommendation.priority]}
                  >
                    {formatPriority(recommendation.priority)}
                  </Badge>
                </div>

                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Action</p>
                  <p className="text-sm font-medium">{recommendation.action}</p>
                </div>

                <div className="flex gap-6">
                  <div>
                    <p className="text-xs text-muted-foreground">Monthly revenue</p>
                    <p className="text-sm font-semibold text-green-700">
                      {formatCurrency(recommendation.monthly_revenue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Churn probability</p>
                    <p className="text-sm font-semibold">
                      {recommendation.churn_probability === null
                        ? "Not available"
                        : `${(Number(recommendation.churn_probability) * 100).toFixed(1)}%`}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/40 p-3 dark:bg-muted/30">
                  <p className="mb-1 text-xs text-muted-foreground">Why this action</p>
                  <p className="text-sm">
                    {primaryDriver
                      ? `${primaryDriver.feature} was a leading churn driver.`
                      : recommendation.expected_impact ?? "Model-generated retention action."}
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    className="h-9 flex-1 text-xs"
                    disabled={isUpdating}
                    onClick={() => void onStatusChange(recommendation.id, "completed")}
                  >
                    {isUpdating ? (
                      <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-1.5 size-3.5" />
                    )}
                    Mark as Done
                  </Button>
                  <Button asChild variant="outline" className="h-9 flex-1 text-xs">
                    <Link href="/customers">
                      <ExternalLink className="mr-1.5 size-3.5" />
                      View Customer
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
