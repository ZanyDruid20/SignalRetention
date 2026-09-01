"use client";

import Link from "next/link";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { ChurnChart } from "@/components/dashboard/churn-chart";
import { CustomerOverview } from "@/components/dashboard/customer-overview";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { HealthDistributionChart } from "@/components/dashboard/health-chart";
import { RevenueAtRiskChart } from "@/components/dashboard/risk-chart";
import { ScenarioSimulator } from "@/components/dashboard/simulation";
import { StatCards } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/hooks/use-dashboard";

function DashboardSkeleton() {
  return <div className="space-y-6">
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-40" />)}
    </div>
    <div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-96" /><Skeleton className="h-96" /></div>
    <Skeleton className="h-96" />
  </div>;
}

export default function DashboardPage() {
  const { datasets, selectedDatasetId, summary, isLoading, error, selectDataset, refresh } = useDashboard();

  return (
    <SidebarProvider><AppSidebar /><SidebarInset>
      <main className="min-h-screen bg-[#FCFAF7] p-4 dark:bg-background sm:p-6 lg:p-8">
        <DashboardHeader onRefresh={refresh} isRefreshing={isLoading} />

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-semibold">Dataset snapshot</h2>
            <p className="text-sm text-muted-foreground">All dashboard metrics use the selected completed dataset.</p></div>
          {datasets.length > 0 && <Select value={selectedDatasetId} onValueChange={selectDataset}>
            <SelectTrigger className="w-full sm:w-80"><SelectValue placeholder="Select a dataset" /></SelectTrigger>
            <SelectContent>{datasets.map((dataset) => <SelectItem key={dataset.id} value={dataset.id}>{dataset.name}</SelectItem>)}</SelectContent>
          </Select>}
        </div>

        <div className="mt-8">
          {isLoading && !summary ? <DashboardSkeleton /> : error ?
            <div className="border-y py-16 text-center"><h2 className="text-xl font-semibold">Dashboard unavailable</h2>
              <p className="mt-2 text-muted-foreground">{error}</p><Button className="mt-5" onClick={refresh}>Try again</Button></div> :
          datasets.length === 0 ? <div className="border-y py-16 text-center"><h2 className="text-xl font-semibold">No completed datasets yet</h2>
            <p className="mt-2 text-muted-foreground">Upload a dataset to generate dashboard metrics.</p><Button asChild className="mt-5"><Link href="/datasets">Upload dataset</Link></Button></div> :
          summary && <div className="space-y-8">
            <StatCards summary={summary} />
            <div className="grid gap-6 lg:grid-cols-2"><ChurnChart data={summary.risk_tier_counts} /><RevenueAtRiskChart data={summary.revenue_by_risk_tier} /></div>
            <HealthDistributionChart data={summary.health_score_distribution} />
            <CustomerOverview customers={summary.high_risk_customers} />
            <ScenarioSimulator />
          </div>}
        </div>
      </main>
    </SidebarInset></SidebarProvider>
  );
}
