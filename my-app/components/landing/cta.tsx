import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto text-center px-8">
        <h2 className="text-4xl font-bold">
          Ready to Reduce Customer Churn?
        </h2>

        <p className="mt-4 text-lg text-muted-foreground">
          Start identifying at-risk customers and improve retention today.
        </p>

        <Button className="mt-8">
          Get Started
        </Button>
      </div>
    </section>
  );
}