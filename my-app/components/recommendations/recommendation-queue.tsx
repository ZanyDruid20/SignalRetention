import { Check, ChevronLeft, ChevronRight, Loader2, RotateCcw, Play, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RecommendationOverviewItem, RecommendationStatus, RiskTier } from "@/types/api";

const statusLabels: Record<RecommendationStatus, string> = {
  new: "New",
  in_progress: "In Progress",
  completed: "Completed",
};

const statusStyles: Record<RecommendationStatus, string> = {
  new: "border-blue-200 bg-blue-50 text-blue-700",
  in_progress: "border-purple-200 bg-purple-50 text-purple-700",
  completed: "border-green-200 bg-green-50 text-green-700",
};

const riskStyles: Record<RiskTier, string> = {
  Critical: "border-red-300 bg-red-100 text-red-800",
  High: "border-red-200 bg-red-50 text-red-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  Low: "border-green-200 bg-green-50 text-green-700",
};

function formatCurrency(value: string | null) {
  if (value === null) return "Not available";
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

type RecommendationQueueProps = {
  items: RecommendationOverviewItem[];
  page: number;
  pageSize: number;
  total: number;
  statusFilter: RecommendationStatus | "all";
  search: string;
  updatingId: string | null;
  onStatusFilterChange: (status: RecommendationStatus | "all") => void;
  onSearchChange: (search: string) => void;
  onStatusChange: (id: string, status: RecommendationStatus) => Promise<void>;
  onPageChange: (page: number) => void;
};

const statusFilters: Array<{
  value: RecommendationStatus | "all";
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

export function RecommendationQueue({
  items,
  page,
  pageSize,
  total,
  statusFilter,
  search,
  updatingId,
  onStatusFilterChange,
  onSearchChange,
  onStatusChange,
  onPageChange,
}: RecommendationQueueProps) {
  const totalPages = Math.ceil(total / pageSize);
  const firstItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, total);

  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-lg font-semibold">Recommendation Queue</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              className="pl-9"
              placeholder="Search customer ID"
              aria-label="Search recommendations by customer"
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
          <div
            className="inline-flex w-fit rounded-md border border-[#D8CFC4] bg-white p-1 dark:border-[#3A312A] dark:bg-[#1F1A16]"
            aria-label="Filter recommendations by status"
          >
            {statusFilters.map((filter) => (
              <Button
                key={filter.value}
                type="button"
                variant={statusFilter === filter.value ? "secondary" : "ghost"}
                size="sm"
                className="h-8"
                aria-pressed={statusFilter === filter.value}
                onClick={() => onStatusFilterChange(filter.value)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
      <Card className="overflow-hidden border border-[#E7DED1] bg-card shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]">
        <div className="overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Recommendation</TableHead>
                <TableHead>Monthly Revenue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.customer_identifier}
                  </TableCell>
                  <TableCell>
                    {item.risk_tier ? (
                      <Badge variant="outline" className={riskStyles[item.risk_tier]}>
                        {item.risk_tier === "Medium" ? "Moderate" : item.risk_tier}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">Not available</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-md whitespace-normal">
                    {item.action}
                  </TableCell>
                  <TableCell className="font-semibold text-green-700">
                    {formatCurrency(item.monthly_revenue)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusStyles[item.status]}>
                      {statusLabels[item.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={updatingId === item.id}
                      onClick={() =>
                        void onStatusChange(
                          item.id,
                          item.status === "new" ? "in_progress" :
                          item.status === "in_progress" ? "completed" : "in_progress"
                        )
                      }
                    >
                      {updatingId === item.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : item.status === "new" ? (
                        <Play className="size-4" />
                      ) : item.status === "in_progress" ? (
                        <Check className="size-4" />
                      ) : (
                        <RotateCcw className="size-4" />
                      )}
                      {item.status === "new"
                        ? "Start"
                        : item.status === "in_progress"
                          ? "Complete"
                          : "Reopen"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No recommendations match this status.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {firstItem.toLocaleString()}-{lastItem.toLocaleString()} of{" "}
            {total.toLocaleString()}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <span className="min-w-24 text-center text-sm font-medium">
              Page {totalPages === 0 ? 0 : page} of {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
}
