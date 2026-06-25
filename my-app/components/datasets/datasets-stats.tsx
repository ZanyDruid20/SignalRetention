import {
    CheckCircle2,
    Clock3,
    Database,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type DatasetsStatsProps = {
    totalDatasets: number;
    activeDatasets: number;
    pendingDatasets: number;
};

export function DatasetsStats({ totalDatasets, activeDatasets, pendingDatasets }: DatasetsStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="rounded-2xl border-[#DED8CF] bg-[#FBFAF7] py-0 shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]">
                <CardContent className="flex h-32 items-center gap-4 p-5">
                    <div className="flex size-14 items-center justify-center rounded-xl bg-[#F5ECE4] dark:bg-muted">
                        <Database className="h-6 w-6 text-[#5A3B26]" />
                    </div>

                    <div>
                        <p className="text-lg text-muted-foreground">
                            Total Datasets
                        </p>

                        <h2 className="text-4xl font-bold">
                            {totalDatasets}
                        </h2>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-2xl border-[#DED8CF] bg-[#FBFAF7] py-0 shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]">
                <CardContent className="flex h-32 items-center gap-4 p-5">
                    <div className="flex size-14 items-center justify-center rounded-xl bg-[#EAF3EA] dark:bg-green-950/30">
                        <CheckCircle2 className="h-6 w-6 text-green-700" />
                    </div>

                    <div>
                        <p className="text-lg text-muted-foreground">
                            Active Datasets
                        </p>

                        <h2 className="text-4xl font-bold">
                            {activeDatasets}
                        </h2>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-2xl border-[#DED8CF] bg-[#FBFAF7] py-0 shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]">
                <CardContent className="flex h-32 items-center gap-4 p-5">
                    <div className="flex size-14 items-center justify-center rounded-xl bg-[#FCEEE8] dark:bg-destructive/20">
                        <Clock3 className="h-6 w-6 text-[#A53D13]" />
                    </div>

                    <div>
                        <p className="text-lg text-muted-foreground">
                            Pending Datasets
                        </p>

                        <h2 className="text-4xl font-bold">
                            {pendingDatasets}
                        </h2>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
