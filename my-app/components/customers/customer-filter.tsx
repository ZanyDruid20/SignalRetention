import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CustomerFiltersProps = {
  riskTiers: string[];
  onRiskTiersChange: (riskTiers: string[]) => void;
  contract: string;
  onContractChange: (contract: string) => void;
  revenueRange: string;
  onRevenueRangeChange: (revenueRange: string) => void;
  healthScore: number[];
  onHealthScoreChange: (healthScore: number[]) => void;
  onClearFilters: () => void;
};

const riskOptions = ["Critical", "High Risk", "Moderate", "Low"];

export function CustomerFilters({
  riskTiers,
  onRiskTiersChange,
  contract,
  onContractChange,
  revenueRange,
  onRevenueRangeChange,
  healthScore,
  onHealthScoreChange,
  onClearFilters,
}: CustomerFiltersProps) {
  function toggleRisk(risk: string, checked: boolean) {
    if (checked) {
      onRiskTiersChange([...riskTiers, risk]);
      return;
    }

    onRiskTiersChange(riskTiers.filter((item) => item !== risk));
  }

  return (
    <div className="rounded-xl border border-[#E7DED1] bg-white p-6 dark:border-[#3A312A] dark:bg-[#1F1A16]">
      <div className="mb-8 flex items-center gap-2">
        <SlidersHorizontal className="h-5 w-5" />
        <h2 className="text-2xl font-bold">Filters</h2>
      </div>

      <div className="space-y-8">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Risk Tier
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {riskOptions.map((risk) => (
              <label key={risk} className="flex items-center gap-3">
                <Checkbox
                  checked={riskTiers.includes(risk)}
                  onCheckedChange={(checked) => toggleRisk(risk, checked === true)}
                />
                <span className="text-lg">{risk}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Contract Type
            </p>

            <Select value={contract} onValueChange={onContractChange}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Revenue Range
            </p>

            <Select value={revenueRange} onValueChange={onRevenueRangeChange}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="low">$0 - $10k</SelectItem>
                <SelectItem value="medium">$10k - $25k</SelectItem>
                <SelectItem value="high">$25k+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Health Score
            </p>

            <p className="text-muted-foreground">
              {healthScore[0]} - {healthScore[1]}
            </p>
          </div>

          <Slider
            value={healthScore}
            onValueChange={onHealthScoreChange}
            min={0}
            max={100}
            step={1}
          />
        </div>

        <Button variant="outline" className="w-full" onClick={onClearFilters}>
          Clear All Filters
        </Button>
      </div>
    </div>
  );
}
