"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

import { getCustomerDetail } from "@/lib/api/customer";
import type { CustomerDetail } from "@/types/api";

type UseCustomerDetailResult = {
  customerDetail: CustomerDetail | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useCustomerDetail(
  customerId: string
): UseCustomerDetailResult {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [customerDetail, setCustomerDetail] =
    useState<CustomerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCustomerDetail = useCallback(async () => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      setCustomerDetail(null);
      setIsLoading(false);
      setError("You must be signed in to view this customer.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const token = await getToken({ template: "signalretention" });

      if (!token) {
        throw new Error("Unable to authenticate customer request");
      }

      const detail = await getCustomerDetail(token, customerId);
      setCustomerDetail(detail);
    } catch (error) {
      setCustomerDetail(null);
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load customer detail"
      );
    } finally {
      setIsLoading(false);
    }
  }, [customerId, getToken, isLoaded, isSignedIn]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadCustomerDetail();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadCustomerDetail]);

  return {
    customerDetail,
    isLoading,
    error,
    refresh: loadCustomerDetail,
  };
}
