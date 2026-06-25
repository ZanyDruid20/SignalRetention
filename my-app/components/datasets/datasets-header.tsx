import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

type DatasetsHeaderProps = {
    search: string;
    onSearchChange: (value: string) => void;
};

export function DatasetsHeader({ search, onSearchChange }: DatasetsHeaderProps) {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">
                    Datasets Explorer
                </h1>
                <p className="mt-2 text-xl text-muted-foreground">
                    Upload and manage your datasets for analysis and insights
                </p>
            </div>

            <div className="relative max-w-2xl">
                <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    className="h-12 rounded-2xl border-[#D8D0C5] bg-white pl-14 text-base shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]"
                    placeholder="Search datasets..."
                />
            </div>
        </div>

    )
}
