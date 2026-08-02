"use client";

import dynamic from "next/dynamic";

const ClerkUserButton = dynamic(
  () => import("@clerk/nextjs").then((module) => module.UserButton),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden="true"
        className="size-7 shrink-0 rounded-full bg-muted"
      />
    ),
  }
);

export function UserButton() {
  return <ClerkUserButton />;
}
