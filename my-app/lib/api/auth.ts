import type { UserRead } from "@/types/api";
import { apiGet } from "./client";

export function getCurrentUser(token: string): Promise<UserRead> {
  return apiGet<UserRead>("/auth/me", token);
}