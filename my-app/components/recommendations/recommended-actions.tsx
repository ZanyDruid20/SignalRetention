import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { getPriorityColor, mockRecommendations } from "./recommendation-data";

type RecommendedActionsProps = {
  completedCards: Set<string>;
  onToggleComplete: (id: string) => void;
};

export function RecommendedActions({
  completedCards,
  onToggleComplete,
}: RecommendedActionsProps) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Recommended Actions</h2>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {mockRecommendations.map((recommendation) => {
          const isCompleted = completedCards.has(recommendation.id);

          return (
            <Card
              key={recommendation.id}
              className={`border p-6 transition-all ${
                isCompleted
                  ? "border-[#E7DED1] bg-muted/30 opacity-60 dark:border-[#3A312A] dark:bg-muted/20"
                  : "border-[#E7DED1] bg-card shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {recommendation.customerName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {recommendation.companyName}
                    </p>
                  </div>

                  <Badge
                    variant="outline"
                    className={`whitespace-nowrap border ${getPriorityColor(
                      recommendation.priority
                    )}`}
                  >
                    {recommendation.priority}
                  </Badge>
                </div>

                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Action</p>
                  <p className="text-sm font-medium">
                    {recommendation.action}
                  </p>
                </div>

                <div className="flex gap-4 pt-2">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Revenue Saved
                    </p>
                    <p className="text-sm font-semibold text-green-600">
                      {recommendation.revenueSaved}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Confidence</p>
                    <p className="text-sm font-semibold">
                      {recommendation.confidenceScore}%
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/40 p-3 dark:bg-muted/30">
                  <p className="mb-1 text-xs text-muted-foreground">
                    Why this action
                  </p>
                  <p className="text-sm">{recommendation.reason}</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant={isCompleted ? "secondary" : "default"}
                    className="h-9 flex-1 text-xs"
                    onClick={() => onToggleComplete(recommendation.id)}
                  >
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                    {isCompleted ? "Completed" : "Mark as Done"}
                  </Button>

                  <Button variant="outline" className="h-9 flex-1 text-xs">
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    View Customer
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
