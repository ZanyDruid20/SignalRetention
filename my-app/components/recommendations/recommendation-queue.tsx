import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  getRiskLevelColor,
  getStatusColor,
  mockQueueItems,
} from "./recommendation-data";

export function RecommendationQueue() {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Recommendation Queue</h2>

      <Card className="overflow-hidden border border-[#E7DED1] bg-card shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b hover:bg-transparent dark:border-[#3A312A]">
                <TableHead className="font-medium text-muted-foreground">
                  Customer
                </TableHead>
                <TableHead className="font-medium text-muted-foreground">
                  Risk Level
                </TableHead>
                <TableHead className="font-medium text-muted-foreground">
                  Recommendation
                </TableHead>
                <TableHead className="font-medium text-muted-foreground">
                  Impact
                </TableHead>
                <TableHead className="font-medium text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="w-24 font-medium text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {mockQueueItems.map((item) => (
                <TableRow
                  key={item.id}
                  className="border-b hover:bg-muted/40 dark:border-[#3A312A] dark:hover:bg-muted/30"
                >
                  <TableCell className="text-sm font-medium">
                    {item.customer}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium ${getRiskLevelColor(
                        item.riskLevel
                      )}`}
                    >
                      {item.riskLevel}
                    </Badge>
                  </TableCell>

                  <TableCell className="max-w-xs text-sm">
                    {item.recommendation}
                  </TableCell>

                  <TableCell className="text-sm font-semibold text-green-600">
                    {item.impact}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
