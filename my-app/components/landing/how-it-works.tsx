import { Card, CardContent } from "@/components/ui/card";

export function HowItWorks() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-8">
        <h2 className="text-4xl font-bold text-center">
          How SignalRetention Works
        </h2>

        <p className="text-center text-muted-foreground mt-4">
          Analyze customer data and identify churn risks in three simple steps.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold">1. Upload Data</h3>
              <p className="mt-2 text-muted-foreground">
                Upload customer datasets in CSV format.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold">2. Generate Predictions</h3>
              <p className="mt-2 text-muted-foreground">
                Machine learning analyzes customer behavior and predicts churn.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold">3. Take Action</h3>
              <p className="mt-2 text-muted-foreground">
                Use recommendations to improve retention and reduce churn.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}