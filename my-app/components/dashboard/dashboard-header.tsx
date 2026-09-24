"use client";

import { RefreshCw } from "lucide-react";

import { UserButton } from "@/components/auth/user-button";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthUser } from "@/hooks/use-auth-user";

export function DashboardHeader({ onRefresh, isRefreshing }: {
    onRefresh: () => void;
    isRefreshing: boolean;
}) {
    const { user, isLoading, error } = useAuthUser();

    return (
        <div className="flex items-start justify-between gap-4 border-b border-[rgb(231,222,209)] pb-6 dark:border-border">
            {/* Left side */}
            <div className="flex min-w-0 items-start gap-2">
                <SidebarTrigger className="mt-0.5 shrink-0" />
                <div className="min-w-0">
                    <h1 className="text-2xl font-bold sm:text-3xl">
                        Dashboard Overview
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {isLoading
                            ? "Loading account..."
                            : error
                              ? "Account details are temporarily unavailable"
                              : `Monitor and analyze customer retention metrics for ${user?.name ?? "your account"}`}
                    </p>
                </div>
            </div>
            {/* Right side */}
            <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={onRefresh}
                    disabled={isRefreshing} aria-label="Refresh dashboard">
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                </Button>
                <UserButton />
            </div>
        </div>
    );
}
