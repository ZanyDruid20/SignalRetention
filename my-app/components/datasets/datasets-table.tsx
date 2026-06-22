import { CheckCircle, Eye, Trash2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

type Dataset = {
  name: string;
  rows: string;
  columns: number;
  status: "Processed" | "Processing" | "Failed";
  uploadedAt: string;
  quality: string;
};

const datasets: Dataset[] = [
  {
    name: "customer_churn_data.csv",
    rows: "12,547",
    columns: 18,
    status: "Processed",
    uploadedAt: "Today",
    quality: "94%",
  },
  {
    name: "subscription_activity.csv",
    rows: "8,921",
    columns: 14,
    status: "Processed",
    uploadedAt: "Yesterday",
    quality: "91%",
  },
  {
    name: "support_tickets.csv",
    rows: "3,402",
    columns: 9,
    status: "Processed",
    uploadedAt: "3 days ago",
    quality: "88%",
  },
];

function StatusBadge({ status }: { status: Dataset["status"] }) {
  const styles = {
    Processed: "bg-green-50 text-green-700 border-green-200",
    Processing: "bg-orange-50 text-orange-700 border-orange-200",
    Failed: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`rounded-full border px-4 py-1 text-sm font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export function DatasetTable() {
  return (
    <Card className="border-[#E7DED1]">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Uploaded Datasets
        </CardTitle>
      </CardHeader>

      <CardContent className="overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-225">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-4 pb-4 text-lg font-semibold">Dataset</th>
                <th className="px-4 pb-4 text-lg font-semibold">Rows</th>
                <th className="px-4 pb-4 text-lg font-semibold">Columns</th>
                <th className="px-4 pb-4 text-lg font-semibold">Quality</th>
                <th className="px-4 pb-4 text-lg font-semibold">Status</th>
                <th className="px-4 pb-4 text-lg font-semibold">Uploaded</th>
                <th className="px-4 pb-4" />
              </tr>
            </thead>

            <tbody>
              {datasets.map((dataset) => (
                <tr
                  key={dataset.name}
                  className="border-b transition-colors hover:bg-[#F8F5F0]"
                >
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-[#F1ECE4] p-3">
                        <CheckCircle className="h-5 w-5 text-green-700" />
                      </div>

                      <div>
                        <p className="font-semibold">{dataset.name}</p>
                        <p className="text-sm text-muted-foreground">
                          CSV dataset
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-5 font-semibold">{dataset.rows}</td>

                  <td className="px-4 py-5 font-semibold">{dataset.columns}</td>

                  <td className="px-4 py-5 font-semibold">
                    {dataset.quality}
                  </td>

                  <td className="px-4 py-5">
                    <StatusBadge status={dataset.status} />
                  </td>

                  <td className="px-4 py-5 text-muted-foreground">
                    {dataset.uploadedAt}
                  </td>

                  <td className="px-4 py-5">
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button variant="outline" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}