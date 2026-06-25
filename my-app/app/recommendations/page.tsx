"use client";

import { useState } from "react";
import { mockRecommendations } from "@/components/recommendations/recommendation-data";
import { RecommendationStats } from "@/components/recommendations/recommendation-stats";
import { RecommendedActions } from "@/components/recommendations/recommended-actions";
import { RecommendationQueue } from "@/components/recommendations/recommendation-queue";

export default function RecommendationsPage() {
  const [completedCards, setCompletedCards] = useState<Set<string>>(
    new Set(mockRecommendations.filter((item) => item.completed).map((item) => item.id))
  );

  const toggleComplete = (id: string) => {
    const nextCompletedCards = new Set(completedCards);

    if (nextCompletedCards.has(id)) {
      nextCompletedCards.delete(id);
    } else {
      nextCompletedCards.add(id);
    }

    setCompletedCards(nextCompletedCards);
  };

  return (
    <div className="min-h-screen space-y-8 bg-[#FCFAF7] p-8 dark:bg-background">
      <div>
        <h1 className="text-3xl font-bold">Recommendations</h1>

        <p className="mt-2 text-muted-foreground">
          Prioritized retention actions based on predicted churn risk and revenue
          impact.
        </p>
      </div>

      <RecommendationStats completedCount={completedCards.size} />

      <RecommendedActions
        completedCards={completedCards}
        onToggleComplete={toggleComplete}
      />

      <RecommendationQueue />
    </div>
  );
}
