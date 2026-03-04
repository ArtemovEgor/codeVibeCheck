import type {
  IApiResponse,
  IAuthResponse,
  ILoginCredentials,
  IRegisterCredentials,
  IUser,
} from "@/types/shared";
import { delay } from "./delay";

const MOCK_USER: IUser = {
  id: "1",
  name: "Alex",
  email: "alex@example.com",
  avatarUrl: undefined,
  createdAt: new Date().toISOString(),
};

const MOCK_TOKEN = "mock-jwt-token";

class AuthMock {
  private currentUser: IUser = MOCK_USER;

  public async login(
    credentials: ILoginCredentials,
  ): Promise<IApiResponse<IAuthResponse>> {
    await delay();
    this.currentUser = { ...MOCK_USER, email: credentials.email };
    return {
      success: true,
      data: { user: this.currentUser, token: MOCK_TOKEN },
    };
  }

  public async register(
    credentials: IRegisterCredentials,
  ): Promise<IApiResponse<IAuthResponse>> {
    await delay();
    this.currentUser = {
      ...MOCK_USER,
      name: credentials.name,
      email: credentials.email,
    };
    return {
      success: true,
      data: { user: this.currentUser, token: MOCK_TOKEN },
    };
  }

  public async getCurrentUser(): Promise<IApiResponse<IUser>> {
    await delay();
    return { success: true, data: this.currentUser };
  }

  public async logout(): Promise<void> {
    this.currentUser = MOCK_USER;
    await delay();
  }
}

export const authMock = new AuthMock();
