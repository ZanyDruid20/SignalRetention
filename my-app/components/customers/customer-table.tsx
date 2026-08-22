"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { RiskTier } from "@/types/api";
import type {
  CustomerExplorerRow,
  CustomerStatus,
} from "@/types/view-models";

const riskLabels: Record<RiskTier, string> = {
  Critical: "Critical",
  High: "High Risk",
  Medium: "Moderate",
  Low: "Low",
};

const riskStyles: Record<RiskTier, string> = {
  Critical: "border-red-300 bg-red-100 text-red-800",
  High: "border-red-200 bg-red-50 text-red-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  Low: "border-green-200 bg-green-50 text-green-700",
};

const statusStyles: Record<CustomerStatus, string> = {
  Active: "border-green-200 bg-green-50 text-green-700",
  Inactive: "border-orange-200 bg-orange-50 text-orange-700",
  Unknown: "border-gray-200 bg-gray-50 text-gray-700",
};

type CustomerTableProps = {
  rows: CustomerExplorerRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  deletingCustomerId: string | null;
  deleteError: string | null;
  onDeleteCustomer: (customerId: string) => Promise<boolean>;
  onPageChange: (page: number) => void;
};

function RiskBadge({ risk }: { risk: RiskTier | null }) {
  if (risk === null) {
    return <span className="text-sm text-muted-foreground">Not available</span>;
  }

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${riskStyles[risk]}`}
    >
      {riskLabels[risk]}
    </span>
  );
}

function StatusBadge({ status }: { status: CustomerStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

function formatCurrency(value: number | null) {
  if (value === null) return "Not available";

  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function getInitials(identifier: string) {
  const letters = identifier.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2);
  return letters.toUpperCase() || "--";
}

export function CustomerTable({
  rows,
  page,
  pageSize,
  total,
  totalPages,
  deletingCustomerId,
  deleteError,
  onDeleteCustomer,
  onPageChange,
}: CustomerTableProps) {
  const [customerToDelete, setCustomerToDelete] =
    useState<CustomerExplorerRow | null>(null);
  const firstItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, total);

  async function confirmDelete() {
    if (!customerToDelete) return;

    const deleted = await onDeleteCustomer(customerToDelete.id);
    if (deleted) setCustomerToDelete(null);
  }

  return (
    <Card className="border-[#E7DED1] bg-white shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Customers ({total.toLocaleString()})
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[920px]">
            <thead>
              <tr className="border-b border-[#D8CFC4] text-left text-muted-foreground dark:border-[#3A312A]">
                <th className="px-4 pb-4 font-semibold">Customer</th>
                <th className="px-4 pb-4 font-semibold">Risk Tier</th>
                <th className="px-4 pb-4 font-semibold">Health</th>
                <th className="px-4 pb-4 font-semibold">Churn Probability</th>
                <th className="px-4 pb-4 font-semibold">Monthly Revenue</th>
                <th className="px-4 pb-4 font-semibold">Contract</th>
                <th className="px-4 pb-4 font-semibold">Status</th>
                <th className="px-4 pb-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b border-[#D8CFC4] transition-colors hover:bg-[#F8F5F0] dark:border-[#3A312A] dark:hover:bg-muted/40"
                >
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full border bg-[#F1ECE4] text-sm font-medium dark:border-[#3A312A] dark:bg-muted">
                        {getInitials(customer.customerName)}
                      </div>
                      <span className="font-semibold">
                        {customer.customerName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <RiskBadge risk={customer.riskTier} />
                  </td>
                  <td className="px-4 py-5 font-semibold">
                    {customer.healthScore ?? "Not available"}
                  </td>
                  <td className="px-4 py-5 font-semibold">
                    {customer.churnProbability === null
                      ? "Not available"
                      : `${customer.churnProbability.toFixed(1)}%`}
                  </td>
                  <td className="px-4 py-5 font-semibold">
                    {formatCurrency(customer.monthlyRevenue)}
                  </td>
                  <td className="px-4 py-5 text-muted-foreground">
                    {customer.contractType ?? "Not available"}
                  </td>
                  <td className="px-4 py-5">
                    <StatusBadge status={customer.status} />
                  </td>
                  <td className="px-4 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="icon"
                        title={`View ${customer.customerName}`}
                      >
                        <Link
                          href={`/customers/${customer.id}`}
                          aria-label={`View ${customer.customerName}`}
                        >
                          <Eye className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        title={`Delete ${customer.customerName}`}
                        aria-label={`Delete ${customer.customerName}`}
                        disabled={deletingCustomerId !== null}
                        onClick={() => setCustomerToDelete(customer)}
                      >
                        {deletingCustomerId === customer.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    No customers match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#D8CFC4] pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-[#3A312A]">
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
      </CardContent>

      <Dialog
        open={customerToDelete !== null}
        onOpenChange={(open) => {
          if (!open && deletingCustomerId === null) setCustomerToDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete customer?</DialogTitle>
            <DialogDescription>
              This permanently deletes {customerToDelete?.customerName} and its
              related prediction and recommendations. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <p role="alert" className="text-sm text-red-700">
              {deleteError}
            </p>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={deletingCustomerId !== null}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              disabled={deletingCustomerId !== null}
              onClick={() => void confirmDelete()}
            >
              {deletingCustomerId !== null && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Delete customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
