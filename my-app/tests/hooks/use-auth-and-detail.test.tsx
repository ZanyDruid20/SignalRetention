import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useCustomerDetail } from "@/hooks/use-customer-detail";
import { makeCustomer, makeUser } from "@/tests/fixtures/factories";

const mocks = vi.hoisted(() => ({ auth: { getToken: vi.fn(), isLoaded: true, isSignedIn: true }, getCurrentUser: vi.fn(), getCustomerDetail: vi.fn() }));
vi.mock("@clerk/nextjs", () => ({ useAuth: () => mocks.auth }));
vi.mock("@/lib/api/auth", () => ({ getCurrentUser: mocks.getCurrentUser }));
vi.mock("@/lib/api/customer", () => ({ getCustomerDetail: mocks.getCustomerDetail }));

describe("authentication data hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.isLoaded = true;
    mocks.auth.isSignedIn = true;
    mocks.auth.getToken.mockResolvedValue("token");
  });

  it("loads the current authenticated user", async () => {
    const user = makeUser();
    mocks.getCurrentUser.mockResolvedValue(user);
    const { result } = renderHook(() => useAuthUser());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toEqual(user);
    expect(mocks.getCurrentUser).toHaveBeenCalledWith("token");
  });

  it("finishes without an API request when signed out", async () => {
    mocks.auth.isSignedIn = false;
    const { result } = renderHook(() => useAuthUser());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(mocks.getCurrentUser).not.toHaveBeenCalled();
  });

  it("surfaces token failures safely", async () => {
    mocks.auth.getToken.mockResolvedValue(null);
    const { result } = renderHook(() => useAuthUser());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe("Failed to get token");
  });

  it("loads owned customer details", async () => {
    const detail = { customer: makeCustomer(), dataset_name: "Demo", dataset_filename: "demo.csv", prediction: null, recommendations: [] };
    mocks.getCustomerDetail.mockResolvedValue(detail);
    const { result } = renderHook(() => useCustomerDetail("customer-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.customerDetail).toEqual(detail);
    expect(mocks.getCustomerDetail).toHaveBeenCalledWith("token", "customer-1");
  });

  it("blocks customer detail while signed out", async () => {
    mocks.auth.isSignedIn = false;
    const { result } = renderHook(() => useCustomerDetail("customer-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe("You must be signed in to view this customer.");
    expect(mocks.getCustomerDetail).not.toHaveBeenCalled();
  });
});
