"use client";

import { UserButton } from "@clerk/nextjs";
import { RefreshCw, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
    return (
        <div className="flex items-center justify-between border-b border-[rgb(231,222,209)] pb-6 dark:border-border">
            {/* Left side */}
            <div>
                <h1 className="text-3xl font-bold">
                    Dashboard Overview
                </h1>
                <p className="text-sm text-muted-foreground">
                    Monitor and analyze customer retention metrics
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
