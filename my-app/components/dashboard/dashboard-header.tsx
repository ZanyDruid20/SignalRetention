"use client";

import { RefreshCw } from "lucide-react";

import { UserButton } from "@/components/auth/user-button";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/hooks/use-auth-user";

export function DashboardHeader({ onRefresh, isRefreshing }: {
    onRefresh: () => void;
    isRefreshing: boolean;
}) {
    const { user, isLoading, error } = useAuthUser();

    return (
        <div className="flex items-center justify-between border-b border-[rgb(231,222,209)] pb-6 dark:border-border">
            {/* Left side */}
            <div>
                <h1 className="text-3xl font-bold">
                    Dashboard Overview
                </h1>
                <p className="text-sm text-muted-foreground">
                    {isLoading
                        ? "Loading account..."
                        : error
                          ? "Unable to verify backend account"
                          : `Monitor and analyze customer retention metrics for ${user?.name ?? "your account"}`}
                </p>
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
