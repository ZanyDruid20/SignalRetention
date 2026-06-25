"use client";

import { useState } from "react";

import { CustomerHeader } from "@/components/customers/customer-header";
import { CustomerStats } from "@/components/customers/customer-stats";
import { CustomerFilters } from "@/components/customers/customer-filter";
import { CustomerTable } from "@/components/customers/customer-table";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [riskTiers, setRiskTiers] = useState<string[]>([]);
  const [contract, setContract] = useState("all");
  const [revenueRange, setRevenueRange] = useState("all");
  const [healthScore, setHealthScore] = useState([0, 100]);

  return (
    <div className="min-h-screen bg-[#F5F1EA] dark:bg-background">
      <header className="border-b border-[#D8D0C5] bg-[#FBFAF7] px-12 py-6 dark:border-border dark:bg-background">
        <CustomerHeader search={search} onSearchChange={setSearch} />
      </header>

      <main className="space-y-8 px-12 py-8">
        <CustomerStats />
        { /* Customer Filter */ }
        <CustomerFilters
          riskTiers={riskTiers}
          onRiskTiersChange={setRiskTiers}
          contract={contract}
          onContractChange={setContract}
          revenueRange={revenueRange}
          onRevenueRangeChange={setRevenueRange}
          healthScore={healthScore}
          onHealthScoreChange={setHealthScore}
          onClearFilters={() => {
            setRiskTiers([]);
            setContract("all");
            setRevenueRange("all");
            setHealthScore([0, 100]);
          }}
        />
        { /* Customer Table */ }
        <CustomerTable
          search={search}
          riskTiers={riskTiers}
          contract={contract}
          revenueRange={revenueRange}
          healthScore={healthScore}
        />
      </main>

    </div>
  );
}
