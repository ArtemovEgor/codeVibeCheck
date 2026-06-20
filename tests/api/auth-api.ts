import { ENDPOINTS } from "@/api/endpoints";
import type { IAuthResponse, IRegisterCredentials } from "@/types/shared";
import type { APIRequestContext } from "@playwright/test";
import { validPassword } from "tests/constants/auth";

export class PlaywrightAuthApi {
  private request: APIRequestContext;
  private apiBaseUrl: string;
  constructor(request: APIRequestContext, apiBaseUrl: string) {
    this.request = request;
    this.apiBaseUrl = apiBaseUrl;
  }

  async register(
    credentials?: IRegisterCredentials,
  ): Promise<{ auth: IAuthResponse; password: string }> {
    const payload = credentials || {
      email: `login_test_${Date.now()}@test.com`,
      name: "TestUser",
      password: validPassword,
    };

    const response = await this.request.post(
      `${this.apiBaseUrl}${ENDPOINTS.AUTH.REGISTER}`,
      {
        data: payload,
      },
    );

    if (!response.ok()) throw new Error("API registration failed");

    const json = await response.json();

    return {
      auth: json.data as IAuthResponse,
      password: payload.password,
    };
  }
}
