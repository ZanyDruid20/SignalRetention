import Link from "next/link";

import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between gap-2 p-4 sm:p-8">
      <h1 className="text-xl font-bold sm:text-2xl">SignalRetention</h1>

      <div className="flex shrink-0 items-center gap-1 sm:gap-4">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="transition-all duration-300 hover:scale-105 sm:h-9 sm:px-4"
        >
          <Link href="/sign-in">Sign In</Link>
        </Button>

        <Button
          asChild
          variant="default"
          size="sm"
          className="transition-all duration-300 hover:scale-105 sm:h-9 sm:px-4"
        >
          <Link href="/sign-up">Get Started</Link>
        </Button>
      </div>
    </nav>
  );
}
