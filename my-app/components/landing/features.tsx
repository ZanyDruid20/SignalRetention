import { FeatureCard } from "@/components/landing/feature-cards";

export function Features() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-8">

        <h2 className="text-4xl font-bold text-center">
          Everything You Need to Reduce Churn
        </h2>

        <p className="mt-4 text-center text-muted-foreground">
          AI-powered insights to help businesses understand and retain customers.
        </p>

        <div className="grid gap-6 mt-12 md:grid-cols-3">
          <FeatureCard
            title="Predict Churn"
            description="Identify customers at risk of leaving before churn impacts revenue."
          />

          <FeatureCard
            title="Explain Risk"
            description="Understand the factors driving churn with customer health scores and risk insights."
          />

          <FeatureCard
            title="Retention Recommendations"
            description="Receive actionable recommendations to improve retention and strengthen customer relationships."
          />
        </div>
      </div>
    </section>
  );
}
