import { RiskDistributionChart } from "@/components/predictions/risk-distribution-chart";
import { HighRiskCustomersTable } from "@/components/predictions/high-risk-table";
import { Card, CardContent } from "@/components/ui/card";

export default function PredictionsPage() {
  return (
    <div className="min-h-screen bg-[#FCFAF7] p-8 dark:bg-background">
      <div>
        <h1 className="text-4xl font-bold">Predictions</h1>

        <p className="mt-2 text-lg text-muted-foreground">
          Monitor churn predictions and identify customers at risk
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-4">
        <Card className="border-[#E7DED1] bg-white shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Critical Risk</p>
            <h2 className="mt-2 text-3xl font-bold text-red-700">18</h2>
          </CardContent>
        </Card>

        <Card className="border-[#E7DED1] bg-white shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">High Risk</p>
            <h2 className="mt-2 text-3xl font-bold text-orange-700">42</h2>
          </CardContent>
        </Card>

        <Card className="border-[#E7DED1] bg-white shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Avg Churn Probability</p>
            <h2 className="mt-2 text-3xl font-bold">37%</h2>
          </CardContent>
        </Card>

        <Card className="border-[#E7DED1] bg-white shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Revenue At Risk</p>
            <h2 className="mt-2 text-3xl font-bold">$284K</h2>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <RiskDistributionChart />
      </div>

      <div className="mt-8">
        <HighRiskCustomersTable />
      </div>
    </div>
  );
}
