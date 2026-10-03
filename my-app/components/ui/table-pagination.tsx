"use client";

import type { FormEvent } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type TablePaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

function getVisiblePages(page: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([
    1,
    2,
    page - 1,
    page,
    page + 1,
    totalPages - 1,
    totalPages,
  ]);
  return [...pages]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);
}

export function TablePagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  className,
}: TablePaginationProps) {
  const firstItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, total);
  const visiblePages = getVisiblePages(page, totalPages);

  function goToPage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const requestedPage = Number(data.get("page"));

    if (!Number.isInteger(requestedPage) || totalPages === 0) return;
    onPageChange(Math.min(Math.max(requestedPage, 1), totalPages));
    form.reset();
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div>
        <p className="text-sm text-muted-foreground">
          Showing {firstItem.toLocaleString()}-{lastItem.toLocaleString()} of{" "}
          {total.toLocaleString()}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Page {totalPages === 0 ? 0 : page} of {totalPages.toLocaleString()}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1" aria-label="Pagination">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="First page"
            title="First page"
            disabled={page <= 1}
            onClick={() => onPageChange(1)}
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="size-4" />
            <span className="hidden lg:inline">Previous</span>
          </Button>

          <div className="hidden items-center gap-1 md:flex">
            {visiblePages.map((visiblePage, index) => {
              const previousPage = visiblePages[index - 1];
              return (
                <div key={visiblePage} className="flex items-center gap-1">
                  {previousPage !== undefined && visiblePage - previousPage > 1 && (
                    <span className="flex size-8 items-center justify-center text-muted-foreground">
                      &hellip;
                    </span>
                  )}
                  <Button
                    type="button"
                    variant={visiblePage === page ? "default" : "outline"}
                    size="icon-sm"
                    aria-label={`Page ${visiblePage}`}
                    aria-current={visiblePage === page ? "page" : undefined}
                    onClick={() => onPageChange(visiblePage)}
                  >
                    {visiblePage}
                  </Button>
                </div>
              );
            })}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="Next page"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <span className="hidden lg:inline">Next</span>
            <ChevronRight className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Last page"
            title="Last page"
            disabled={page >= totalPages}
            onClick={() => onPageChange(totalPages)}
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>

        {totalPages > 1 && (
          <form className="flex items-center gap-1" onSubmit={goToPage}>
            <Input
              name="page"
              type="number"
              inputMode="numeric"
              min={1}
              max={totalPages}
              placeholder={String(page)}
              aria-label="Go to page"
              className="h-8 w-16 px-2 text-center"
            />
            <Button type="submit" variant="outline" size="sm">
              Go
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
