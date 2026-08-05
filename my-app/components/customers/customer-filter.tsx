import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import type { RiskTier } from "@/types/api";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CustomerFiltersProps = {
  riskTiers: RiskTier[];
  onRiskTiersChange: (riskTiers: RiskTier[]) => void;
  contract: string;
  onContractChange: (contract: string) => void;
  revenueRange: string;
  onRevenueRangeChange: (revenueRange: string) => void;
  healthScore: number[];
  onHealthScoreChange: (healthScore: number[]) => void;
  onClearFilters: () => void;
};

const riskOptions: { value: RiskTier; label: string }[] = [
  { value: "Critical", label: "Critical" },
  { value: "High", label: "High Risk" },
  { value: "Medium", label: "Moderate" },
  { value: "Low", label: "Low" },
];

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
  function toggleRisk(risk: RiskTier, checked: boolean) {
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
              <label key={risk.value} className="flex items-center gap-3">
                <Checkbox
                  checked={riskTiers.includes(risk.value)}
                  onCheckedChange={(checked) =>
                    toggleRisk(risk.value, checked === true)
                  }
                />
                <span className="text-lg">{risk.label}</span>
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
                <SelectItem value="month-to-month">Month-to-month</SelectItem>
                <SelectItem value="one year">One year</SelectItem>
                <SelectItem value="two year">Two year</SelectItem>
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
                <SelectItem value="low">$0 - $50</SelectItem>
                <SelectItem value="medium">$50 - $90</SelectItem>
                <SelectItem value="high">$90+</SelectItem>
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
