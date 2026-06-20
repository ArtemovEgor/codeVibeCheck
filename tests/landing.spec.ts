import { test } from "./fixtures/fixtures";

test.describe("landing page", () => {
  test("opening and closing login popup", async ({ landingPage }) => {
    await landingPage.goToLogin();
    await landingPage.verifyLoginOpen();

    await landingPage.clickModalOverlay();
    await landingPage.verifyModalClose();
  });

  test("opening and closing registration popup", async ({ landingPage }) => {
    await landingPage.goToRegister();
    await landingPage.verifyRegistrationOpen();

    await landingPage.clickModalOverlay();
    await landingPage.verifyModalClose();
  });

  test.describe("CTA buttons", () => {
    test("hero CTA button", async ({ landingPage }) => {
      await landingPage.clickHeroCTA();
      await landingPage.verifyRegistrationOpen();

      await landingPage.clickModalOverlay();
      await landingPage.verifyModalClose();
    });

    test("footer CTA button", async ({ landingPage }) => {
      landingPage.clickFooterCTA();
      await landingPage.verifyRegistrationOpen();

      await landingPage.clickModalOverlay();
      await landingPage.verifyModalClose();
    });
  });
});
