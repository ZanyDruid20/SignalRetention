import Link from "next/link";

import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between p-8">
      <h1 className="text-2xl font-bold">SignalRetention</h1>

      <div className="flex items-center gap-4">
        <Button
          asChild
          variant="ghost"
          className="transition-all duration-300 hover:scale-105"
        >
          <Link href="/sign-in">Sign In</Link>
        </Button>

        <Button
          asChild
          variant="default"
          className="transition-all duration-300 hover:scale-105"
        >
          <Link href="/sign-up">Get Started</Link>
        </Button>
      </div>
    </nav>
  );
}
