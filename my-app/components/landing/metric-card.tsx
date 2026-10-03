import {Card, CardContent, CardHeader, CardTitle,} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  title: string;
  value: string;
  trend: string;
  trendTone?: "positive" | "negative";
};

export function MetricCard({
  title,
  value,
  trend,
  trendTone = "positive",
}: MetricCardProps) {
  return (
    <Card
      className="
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
      "
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-5xl font-bold">{value}</p>

        <p className={cn(
          "mt-2",
          trendTone === "negative" ? "text-red-600" : "text-green-600",
        )}>
          {trend}
        </p>
      </CardContent>
    </Card>
  );
}
