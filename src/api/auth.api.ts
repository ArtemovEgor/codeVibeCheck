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
  public async login(credentials: ILoginCredentials): Promise<IAuthResponse> {
    if (apiService.isMockMode) {
      const response = await authMock.login(credentials);
      apiService.setToken(response.token);
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

    return response.data;
  }

  public async register(
    credentials: IRegisterCredentials,
  ): Promise<IAuthResponse> {
    if (apiService.isMockMode) {
      const response = await authMock.register(credentials);
      apiService.setToken(response.token);
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

    return response.data;
  }

  public async getCurrentUser(): Promise<IUser> {
    if (apiService.isMockMode) return authMock.getCurrentUser();

    const response = await apiService.send<IApiResponse<IUser>>(
      ENDPOINTS.AUTH.ME,
      {
        method: "GET",
      },
    );

    return response.data;
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
