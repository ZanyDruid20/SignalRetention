import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SettingsPage from "@/app/settings/page";

const mocks = vi.hoisted(() => ({
  setTheme: vi.fn(),
}));

vi.mock("@/components/Theme/theme-provider", () => ({
  useTheme: () => ({ theme: "light", setTheme: mocks.setTheme }),
}));

vi.mock("@/hooks/use-auth-user", () => ({
  useAuthUser: () => ({
    user: {
      id: "user-db-1",
      clerk_user_id: "user_clerk_1",
      email: "tester@example.com",
      name: "Demo Tester",
      created_at: "2026-10-07T00:00:00Z",
      updated_at: "2026-10-07T00:00:00Z",
    },
    isLoading: false,
    error: null,
  }),
}));

describe("SettingsPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mocks.setTheme.mockClear();
  });

  it("shows the signed-in account and persists profile settings", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    expect(screen.getByDisplayValue("Demo Tester")).toHaveAttribute("readonly");
    expect(screen.getByDisplayValue("tester@example.com")).toHaveAttribute("readonly");
    expect(screen.getByRole("link", { name: "Back to Home" })).toHaveAttribute(
      "href",
      "/dashboard",
    );

    const companyInput = screen.getByDisplayValue("SignalRetention");
    await waitFor(() => expect(companyInput).toBeEnabled());
    await user.clear(companyInput);
    await user.type(companyInput, "Demo Company");
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(screen.getByRole("status")).toHaveTextContent("Profile settings saved");
    expect(
      JSON.parse(window.localStorage.getItem("signalretention-settings:user-db-1")!),
    ).toMatchObject({ company: "Demo Company", role: "admin" });
  });

  it("restores saved notification preferences for the account", async () => {
    window.localStorage.setItem(
      "signalretention-settings:user-db-1",
      JSON.stringify({
        company: "Saved Company",
        role: "analyst",
        notifications: { weeklySummary: false },
      }),
    );

    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Saved Company")).toBeInTheDocument();
    });
    expect(screen.getByRole("checkbox", { name: "Weekly summary" })).not.toBeChecked();
  });
});
