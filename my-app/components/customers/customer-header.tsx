import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

type CustomerHeaderProps = {
    search: string;
    onSearchChange: (value: string) => void;
};

export function CustomerHeader({ search, onSearchChange }: CustomerHeaderProps) {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">
                    Customer Explorer
                </h1>
                <p className="mt-2 text-xl text-muted-foreground">
                    Identify at-risk customers and take retention actions
                </p>
            </div>

            <div className="relative max-w-2xl">
                <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    className="h-12 rounded-2xl border-[#D8D0C5] bg-white pl-14 text-base shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]"
                    placeholder="Search customers, companies, emails..."
                />
            </div>
        </div>

    )
}
