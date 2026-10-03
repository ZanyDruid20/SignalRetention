import { expect, test } from "@playwright/test";

test.describe("public landing page", () => {
  test("shows the product and authentication entry points", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Predict Customer Churn Before It Happens" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign In" })).toHaveAttribute(
      "href",
      "/sign-in",
    );
    const getStartedLinks = page.getByRole("link", { name: "Get Started" });
    await expect(getStartedLinks).toHaveCount(3);
    for (const link of await getStartedLinks.all()) {
      await expect(link).toHaveAttribute("href", "/sign-up");
    }
    await expect(page.getByRole("link", { name: "Learn More" })).toHaveAttribute(
      "href",
      "#features",
    );
  });

  test("does not overflow a mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  });
});

test("redirects an unauthenticated visitor away from protected data", async ({ page }) => {
  await page.goto("/datasets");

  await expect(page).toHaveURL(/\/sign-in/);
  await expect(page.getByText(/Sign in/i).first()).toBeVisible();
});
