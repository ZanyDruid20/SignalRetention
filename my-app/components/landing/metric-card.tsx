import {Card, CardContent, CardHeader, CardTitle,} from "@/components/ui/card";

type MetricCardProps = {
  title: string;
  value: string;
  trend: string;
};

export function MetricCard({
  title,
  value,
  trend,
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

        <p className="text-green-600 mt-2">
          {trend}
        </p>
      </CardContent>
    </Card>
  );
}