"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

import { getCurrentUser } from "@/lib/api/auth";
import type { UserRead } from "@/types/api";

type UseAuthUserResult = {
  user: UserRead | null;
  isLoading: boolean;
  error: string | null;
};

export function useAuthUser(): UseAuthUserResult {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [user, setUser] = useState<UserRead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      if (!isLoaded) {
        return;
      }

      if (!isSignedIn) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const token = await getToken({ template: "signalretention" });

        if (!token) {
          throw new Error("Failed to get token");
        }

        const currentUser = await getCurrentUser(token);
        setUser(currentUser);
      } catch (error) {
        setUser(null);
        setError(
          error instanceof Error ? error.message : "Unable to load current user"
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [getToken, isLoaded, isSignedIn]);

  return {
    user,
    isLoading,
    error,
  };
}
