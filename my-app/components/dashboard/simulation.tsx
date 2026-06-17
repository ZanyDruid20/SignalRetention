"use client";

import { useState } from "react";
import { TrendingUp, ArrowRight } from "lucide-react";

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
  const [intervention, setIntervention] = useState("discount");
  const [segment, setSegment] = useState("high-risk");
  const [intensity, setIntensity] = useState([50]);
  const [showResults, setShowResults] = useState(false);

  const runSimulation = () => {
    setShowResults(true);
  };

  return (
    <Card className="border-[#E7DED1]">
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
                Intervention Type
              </label>

              <Select
                value={intervention}
                onValueChange={setIntervention}
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
                onValueChange={setSegment}
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
                max={100}
                step={1}
              />

              <p className="mt-4 text-muted-foreground">
                Higher intensity means more aggressive intervention
                with higher costs.
              </p>
            </div>

            <Button
              onClick={runSimulation}
              className="h-14 w-full bg-[#5A3B26] hover:bg-[#4A2F1E]"
            >
              Run Simulation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="rounded-xl bg-[#F8F5F0] p-6">
            <h3 className="mb-6 text-2xl font-semibold">
              Projected Impact
            </h3>

            {!showResults ? (
              <div className="flex h-75 flex-col items-center justify-center text-center">
                <TrendingUp className="mb-4 h-12 w-12 text-muted-foreground" />

                <p className="text-lg text-muted-foreground">
                  Configure parameters and run simulation
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">
                    Revenue Saved
                  </p>

                  <h4 className="text-2xl font-bold">
                    $306,000
                  </h4>
                </div>

                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">
                    Churn Reduction
                  </p>

                  <h4 className="text-2xl font-bold">
                    15%
                  </h4>
                </div>

                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">
                    Customers Retained
                  </p>

                  <h4 className="text-2xl font-bold">
                    127
                  </h4>
                </div>

                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">
                    ROI
                  </p>

                  <h4 className="text-2xl font-bold">
                    2.4x
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