"use client";

import { RefreshCw, Bell } from "lucide-react";

import { UserButton } from "@/components/auth/user-button";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/hooks/use-auth-user";

export function DashboardHeader() {
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
                <Button variant="outline">
                    Last 30 Days
                </Button>

                <Button variant="outline" size="icon">
                    <RefreshCw className="h-4 w-4" />
                </Button>

                <Button variant="outline" size="icon">
                    <Bell className="h-4 w-4" />
                </Button>
                <UserButton />
            </div>
        </div>
    );
}
