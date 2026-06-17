import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/landing/metric-card";

export function Hero() {
  return (
    <section className="bg-[#F5F1EA] py-24">
      <div className="max-w-7xl mx-auto px-8 lg:flex lg:items-center lg:gap-12">

        {/* Left Side */}
        <div className="flex-[1.5]">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            Customer Retention Intelligence
          </p>

          <h1 className="mt-4 text-4xl lg:text-6xl font-bold">
            Predict Customer Churn Before It Happens
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Identify at-risk customers, understand why they are leaving,
            and take action to retain them and maintain revenue.
          </p>

          <div className="mt-8 flex gap-4">
            <Button
            className="
            transition-all
            duration-300
            hover:scale-105
            ">Get Started
            </Button>
            <Button variant="outline" className="transition-all duration-300 hover:scale-105">
              Learn More
            </Button>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex-1 space-y-4 mt-12 lg:mt-0">
          <MetricCard
            title="Revenue at Risk"
            value="$275,000"
            trend="↓ 12.4% from last month"
          />

          <MetricCard
            title="Churn Rate"
            value="8.2%"
            trend="↑ 1.3% from last month"
          />

          <MetricCard
            title="Health Score"
            value="74.7"
            trend="↑ 5.7% from last month"
          />
        </div>

      </div>
    </section>
  );
}