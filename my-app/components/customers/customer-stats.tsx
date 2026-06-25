import {
  Users,
  AlertTriangle,
  DollarSign,
  Activity,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

export function CustomerStats() {
  return (
    <div className="grid max-w-4xl gap-4 md:grid-cols-2">

      {/* Total Customers */}
      <Card className="rounded-2xl border-[#DED8CF] bg-[#FBFAF7] py-0 shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]">
        <CardContent className="flex h-32 items-center gap-4 p-5">

          <div className="flex size-14 items-center justify-center rounded-xl bg-[#F5ECE4] dark:bg-muted">
            <Users className="h-6 w-6 text-[#5A3B26]" />
          </div>

          <div>
            <p className="text-lg text-muted-foreground">
              Total Customers
            </p>

            <h2 className="text-4xl font-bold">
              10
            </h2>
          </div>

        </CardContent>
      </Card>

      {/* High Risk */}
      <Card className="rounded-2xl border-[#DED8CF] bg-[#FBFAF7] py-0 shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]">
        <CardContent className="flex h-32 items-center gap-4 p-5">

          <div className="flex size-14 items-center justify-center rounded-xl bg-[#FCEEE8] dark:bg-destructive/20">
            <AlertTriangle className="h-6 w-6 text-[#A53D13]" />
          </div>

          <div>
            <p className="text-lg text-muted-foreground">
              High Risk Customers
            </p>

            <h2 className="text-4xl font-bold">
              4
            </h2>
          </div>

        </CardContent>
      </Card>

      {/* Revenue Risk */}
      <Card className="rounded-2xl border-[#DED8CF] bg-[#FBFAF7] py-0 shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]">
        <CardContent className="flex h-32 items-center gap-4 p-5">

          <div className="flex size-14 items-center justify-center rounded-xl bg-[#F5ECE4] dark:bg-muted">
            <DollarSign className="h-6 w-6 text-[#A53D13]" />
          </div>

          <div>
            <p className="text-lg text-muted-foreground">
              Revenue At Risk
            </p>

            <h2 className="text-4xl font-bold">
              $94,400
            </h2>
          </div>

        </CardContent>
      </Card>

      {/* Avg Health */}
      <Card className="rounded-2xl border-[#DED8CF] bg-[#FBFAF7] py-0 shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]">
        <CardContent className="flex h-32 items-center gap-4 p-5">

          <div className="flex size-14 items-center justify-center rounded-xl bg-[#EAF3EA] dark:bg-green-950/30">
            <Activity className="h-6 w-6 text-green-700" />
          </div>

          <div>
            <p className="text-lg text-muted-foreground">
              Avg. Health Score
            </p>

            <h2 className="text-4xl font-bold">
              57
            </h2>
          </div>

        </CardContent>
      </Card>

    </div>
  );
}
