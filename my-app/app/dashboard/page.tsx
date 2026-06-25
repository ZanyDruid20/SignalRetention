import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatCards } from "@/components/dashboard/stat-card";
import { ChurnChart } from "@/components/dashboard/churn-chart";
import { RevenueAtRiskChart } from "@/components/dashboard/risk-chart";
import { HealthDistributionChart } from "@/components/dashboard/health-chart";
import { ScenarioSimulator } from "@/components/dashboard/simulation";
import { CustomerOverview } from "@/components/dashboard/customer-overview";

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <div className="min-h-screen bg-[#FCFAF7] p-8 dark:bg-background">
          <DashboardHeader />

          {/* KPI Cards */}
          <div className="mt-8">
            <StatCards />
          </div>

          {/* Churn + Revenue */}
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <ChurnChart />
            <RevenueAtRiskChart />
          </div>

          {/* Health Distribution */}
          <div className="mt-8">
            <HealthDistributionChart />
          </div>

          {/* Scenario Simulator */}
          <div className="mt-8">
            <ScenarioSimulator />
          </div>

          {/* Customer Table */}
          <div className="mt-8">
            <CustomerOverview />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
