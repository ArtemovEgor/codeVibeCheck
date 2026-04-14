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
    apiService.clearToken();
  }

  public async updateName(name: string): Promise<{ name: string }> {
    const response = await apiService.send<IApiResponse<{ name: string }>>(
      ENDPOINTS.AUTH.UPDATE_NAME,
      {
        method: "PATCH",
        body: JSON.stringify({ name }),
      },
    );
    return response.data;
  }

  public async updateEmail(email: string): Promise<{ email: string }> {
    const response = await apiService.send<IApiResponse<{ email: string }>>(
      ENDPOINTS.AUTH.UPDATE_EMAIL,
      {
        method: "PATCH",
        body: JSON.stringify({ email }),
      },
    );
    return response.data;
  }

  public async updatePassword(password: string): Promise<void> {
    await apiService.send<IApiResponse<void>>(ENDPOINTS.AUTH.UPDATE_PASSWORD, {
      method: "PATCH",
      body: JSON.stringify({ password }),
    });
  }

  public async updateAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await apiService.send<IApiResponse<{ avatarUrl: string }>>(
      ENDPOINTS.AUTH.UPDATE_AVATAR,
      { method: "POST", body: formData },
    );
    return response.data;
  }
}

export const authApi = new AuthApi();
