import { test, expect } from "./fixtures/fixtures";
import { EN } from "@/locale/en";
import { RU } from "@/locale/ru";
import {
  backendAuthErrors,
  invalidEmail,
  invalidPassword,
  validEmail,
  validPassword,
  wrongPassword,
} from "./constants/auth";

test.describe("authorization page", () => {
  test("switching between authorization and registration tabs", async ({
    authPage,
  }) => {
    await authPage.switchTab("login");
    await expect(authPage.loginForm).toBeVisible();
    await expect(authPage.page).toHaveURL(/\/login$/);

    await authPage.switchTab("register");
    await expect(authPage.registerForm).toBeVisible();
    await expect(authPage.page).toHaveURL(/\/register$/);

    await authPage.switchTab("login");
    await expect(authPage.loginForm).toBeVisible();
    await expect(authPage.page).toHaveURL(/\/login$/);
  });

  test.describe("login flow", () => {
    test("successful login", async ({ authPage, authApi }) => {
      const testEmail = `login_test_${Date.now()}@test.com`;

      await authApi.register({
        email: testEmail,
        name: "TestUser",
        password: validPassword,
      });

      await authPage.fillLoginForm(testEmail, validPassword);
      await expect(authPage.loginSubmitButton).toBeEnabled();

      await authPage.authorize("login");
      await expect(authPage.page).toHaveURL(/\/dashboard$/);
    });

    test.describe("validation errors", () => {
      let language: typeof EN;

      test.beforeEach(async ({ layout }) => {
        language = (await layout.getActiveLanguage()) === "en" ? EN : RU;
      });

      test("empty form", async ({ authPage }) => {
        await authPage.fillLoginForm("", "");
        await authPage.validateLoginForm();

        await expect(authPage.loginSubmitButton).toBeDisabled();

        await expect(authPage.authErrors.email).toBeVisible();
        await expect(authPage.authErrors.email).toHaveText(
          language.common.validation.empty,
        );

        await expect(authPage.authErrors.password).toBeVisible();
        await expect(authPage.authErrors.password).toHaveText(
          language.common.validation.empty,
        );
      });

      test("invalid email format", async ({ authPage }) => {
        await authPage.fillLoginForm(invalidEmail, validPassword);

        await expect(authPage.loginSubmitButton).toBeDisabled();

        await expect(authPage.authErrors.email).toBeVisible();
        await expect(authPage.authErrors.email).toHaveText(
          language.common.validation.email_error,
        );
      });

      test("invalid password format", async ({ authPage }) => {
        await authPage.fillLoginForm(validEmail, invalidPassword);

        await expect(authPage.loginSubmitButton).toBeDisabled();

        await expect(authPage.authErrors.password).toBeVisible();
        await expect(authPage.authErrors.password).toContainText(
          language.common.validation.too_short,
        );
      });

      test("wrong password", async ({ authPage }) => {
        await authPage.fillLoginForm(validEmail, wrongPassword);

        await expect(authPage.loginSubmitButton).toBeEnabled();
        await authPage.submitLogin();
        await authPage.notification.expectError(
          backendAuthErrors.incorrect_mail_password,
        );
      });
    });
  });

  test.describe("registration flow", () => {
    test("successful registration", async ({ authPage }) => {
      const uniqueEmail = `user_${Date.now()}@test.com`;

      await authPage.fillRegistrationForm("Test", uniqueEmail, validPassword);

      await authPage.authorize("register");
      await expect(authPage.page).toHaveURL(/\/dashboard$/);
    });
  });

  test.describe("logout flow", () => {
    test("successful logout with token cleanup", async ({ dashboard }) => {
      await dashboard.logout();

      await expect(dashboard.page).toHaveURL(/#\//);

      const storage = await dashboard.page.evaluate(() => ({
        token: localStorage.getItem("jwt"),
        keys: Object.keys(localStorage),
      }));

      expect(storage.token).toBeNull();
    });
  });

  test.describe("token persistence", () => {
    test("saving token on reload", async ({ dashboard }) => {
      const storage = await dashboard.page.evaluate(() => ({
        token: localStorage.getItem("jwt"),
        keys: Object.keys(localStorage),
      }));

      expect(storage.token).not.toBeNull();

      await dashboard.page.reload();

      const newStorage = await dashboard.page.evaluate(() => ({
        token: localStorage.getItem("jwt"),
        keys: Object.keys(localStorage),
      }));

      expect(newStorage.token).not.toBeNull();
      expect(newStorage.token).toEqual(storage.token);
    });

    test.describe("App Startup with Existing Token", () => {
      test.use({
        storageState: {
          cookies: [],
          origins: [
            {
              origin: "http://localhost:3000",
              localStorage: [
                {
                  name: "jwt",
                  value: JSON.stringify("valid.mocked.jwt-token"),
                },
              ],
            },
          ],
        },
      });

      test("should automatically authenticate and redirect to dashboard", async ({
        page,
      }) => {
        await page.goto("/");

        await page.waitForURL(/\/dashboard$/);

        await expect(page).toHaveURL(/\/dashboard$/);
      });

      test("should allow direct access to a deep protected route", async ({
        page,
      }) => {
        await page.goto("/library");

        await expect(page).toHaveURL(/\/library$/);
      });
    });
  });
});
