import { test, expect } from "./fixtures/fixtures";

test.describe("landing page", () => {
  test("opening and closing login popup", async ({ landingPage }) => {
    await landingPage.goToLogin();
    await expect(landingPage.modalOverlay).toBeVisible();
    await expect(landingPage.page).toHaveURL(/\/login$/);

    await landingPage.clickModalOverlay();
    await expect(landingPage.modalOverlay).toBeHidden();
    await expect(landingPage.page).toHaveURL(/#\//);
  });

  test("opening and closing registration popup", async ({ landingPage }) => {
    await landingPage.goToRegister();
    await expect(landingPage.modalOverlay).toBeVisible();
    await expect(landingPage.page).toHaveURL(/\/register$/);

    await landingPage.clickModalOverlay();
    await expect(landingPage.modalOverlay).toBeHidden();

    await expect(landingPage.page).toHaveURL(/#\//);
  });

  test("CTA buttons", async ({ landingPage }) => {
    await landingPage.verifyHeroCTA();
    await landingPage.verifyFooterCTA();
  });
});
