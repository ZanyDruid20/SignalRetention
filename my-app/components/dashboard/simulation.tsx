"use client";

import { useState } from "react";
import { ArrowRight, Loader2, TrendingUp } from "lucide-react";

import { useSimulations } from "@/hooks/use-simulations";
import type {
  InterventionType,
  SimulationTargetSegment,
} from "@/types/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Slider } from "@/components/ui/slider";

export function ScenarioSimulator() {
  const {
    datasets,
    result,
    isLoading,
    isRunning,
    error,
    runSimulation,
  } = useSimulations();
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [intervention, setIntervention] =
    useState<InterventionType>("discount");
  const [segment, setSegment] =
    useState<SimulationTargetSegment>("high-risk");
  const [intensity, setIntensity] = useState([50]);
  const selectedDatasetId = datasetId ?? datasets[0]?.id ?? "";

  const handleRunSimulation = async () => {
    if (!selectedDatasetId) return;

    try {
      await runSimulation({
        dataset_id: selectedDatasetId,
        intervention_type: intervention,
        target_segment: segment,
        intensity_percentage: intensity[0],
      });
    } catch {
      // The hook exposes the request error for display below.
    }
  };

  return (
    <Card className="border-[#E7DED1] bg-white dark:border-border dark:bg-card">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">
          Scenario Simulator
        </CardTitle>

        <p className="text-muted-foreground text-lg">
          Model the impact of retention interventions on revenue and churn
        </p>
      </CardHeader>

      <CardContent>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-8">
            <div>
              <label className="mb-3 block text-xl font-semibold">
                Dataset
              </label>

              <Select
                value={selectedDatasetId}
                onValueChange={setDatasetId}
                disabled={isLoading || datasets.length === 0}
              >
                <SelectTrigger className="h-14">
                  <SelectValue
                    placeholder={isLoading ? "Loading datasets..." : "Select dataset"}
                  />
                </SelectTrigger>

                <SelectContent>
                  {datasets.map((dataset) => (
                    <SelectItem key={dataset.id} value={dataset.id}>
                      {dataset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {!isLoading && datasets.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Upload and process a dataset before running a simulation.
                </p>
              ) : null}
            </div>

            <div>
              <label className="mb-3 block text-xl font-semibold">
                Intervention Type
              </label>

              <Select
                value={intervention}
                onValueChange={(value) =>
                  setIntervention(value as InterventionType)
                }
              >
                <SelectTrigger className="h-14">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="discount">
                    Discount
                  </SelectItem>

                  <SelectItem value="onboarding">
                    Onboarding
                  </SelectItem>

                  <SelectItem value="training">
                    Training
                  </SelectItem>

                  <SelectItem value="support">
                    Support
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-3 block text-xl font-semibold">
                Target Segment
              </label>

              <Select
                value={segment}
                onValueChange={(value) =>
                  setSegment(value as SimulationTargetSegment)
                }
              >
                <SelectTrigger className="h-14">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="high-risk">
                    High Risk
                  </SelectItem>

                  <SelectItem value="medium-risk">
                    Medium Risk
                  </SelectItem>

                  <SelectItem value="low-risk">
                    Low Risk
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="mb-4 flex justify-between">
                <span className="text-xl font-semibold">
                  Intervention Intensity
                </span>

                <span className="text-xl">
                  {intensity[0]}%
                </span>
              </div>

              <Slider
                value={intensity}
                onValueChange={setIntensity}
                min={1}
                max={100}
                step={1}
              />

              <p className="mt-4 text-muted-foreground">
                Higher intensity means more aggressive intervention
                with higher costs.
              </p>
            </div>

            <Button
              onClick={handleRunSimulation}
              disabled={!selectedDatasetId || isRunning}
              className="h-14 w-full bg-[#5A3B26] hover:bg-[#4A2F1E]"
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Running Simulation
                </>
              ) : (
                <>
                  Run Simulation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>

            {error ? (
              <p role="alert" className="text-sm text-destructive">
                Unable to run the simulation. Please try again.
              </p>
            ) : null}
          </div>

          <div className="rounded-xl bg-[#F8F5F0] p-6 dark:bg-muted/40">
            <h3 className="mb-6 text-2xl font-semibold">
              Projected Impact
            </h3>

            {!result ? (
              <div className="flex h-75 flex-col items-center justify-center text-center">
                <TrendingUp className="mb-4 h-12 w-12 text-muted-foreground" />

                <p className="text-lg text-muted-foreground">
                  Configure parameters and run simulation
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4 dark:border-border dark:bg-background/40">
                  <p className="text-sm text-muted-foreground">
                    Revenue Saved
                  </p>

                  <h4 className="text-2xl font-bold">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    }).format(Number(result.estimated_revenue_saved))}
                  </h4>
                </div>

                <div className="rounded-lg border p-4 dark:border-border dark:bg-background/40">
                  <p className="text-sm text-muted-foreground">
                    Churn Reduction
                  </p>

                  <h4 className="text-2xl font-bold">
                    {(Number(result.predicted_churn_reduction) * 100).toFixed(1)}%
                  </h4>
                </div>

                <div className="rounded-lg border p-4 dark:border-border dark:bg-background/40">
                  <p className="text-sm text-muted-foreground">
                    Customers Retained
                  </p>

                  <h4 className="text-2xl font-bold">
                    {result.estimated_customers_retained.toLocaleString()}
                  </h4>
                </div>

                <div className="rounded-lg border p-4 dark:border-border dark:bg-background/40">
                  <p className="text-sm text-muted-foreground">
                    ROI
                  </p>

                  <h4 className="text-2xl font-bold">
                    {Number(result.roi).toFixed(2)}x
                  </h4>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
