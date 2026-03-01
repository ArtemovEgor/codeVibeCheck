import type {
  IApiResponse,
  IAuthResponse,
  ILoginCredentials,
  IRegisterCredentials,
  IUser,
} from "@/types/shared";
import { apiService } from "./api-service";
import { ENDPOINTS } from "./endpoints";
import { authMock } from "./mock/auth.mock";

class AuthApi {
  public async login(
    credentials: ILoginCredentials,
  ): Promise<IApiResponse<IAuthResponse>> {
    if (apiService.isMockMode) {
      const response = await authMock.login(credentials);
      apiService.setToken(response.data.token);
      return response;
    }

    const response = await apiService.send<IApiResponse<IAuthResponse>>(
      ENDPOINTS.AUTH.LOGIN,
      {
        method: "POST",
        body: JSON.stringify(credentials),
      },
    );

    apiService.setToken(response.data.token);

    return response;
  }

  public async register(
    credentials: IRegisterCredentials,
  ): Promise<IApiResponse<IAuthResponse>> {
    if (apiService.isMockMode) {
      const response = await authMock.register(credentials);
      apiService.setToken(response.data.token);
      return response;
    }

    const response = await apiService.send<IApiResponse<IAuthResponse>>(
      ENDPOINTS.AUTH.REGISTER,
      {
        method: "POST",
        body: JSON.stringify(credentials),
      },
    );

    apiService.setToken(response.data.token);

    return response;
  }

  public async getCurrentUser(): Promise<IApiResponse<IUser>> {
    if (apiService.isMockMode) return authMock.getCurrentUser();

    return apiService.send<IApiResponse<IUser>>(ENDPOINTS.AUTH.ME, {
      method: "GET",
    });
  }

  public async logout(): Promise<void> {
    if (apiService.isMockMode) {
      await authMock.logout();
      apiService.clearToken();
      return;
    }

    try {
      await apiService.send(ENDPOINTS.AUTH.LOGOUT, { method: "POST" });
    } finally {
      apiService.clearToken();
    }
  }
}

export const authApi = new AuthApi();
