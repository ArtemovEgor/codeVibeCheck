import type {
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
  totalScore: 120,
};

const MOCK_TOKEN = "mock-jwt-token";

class AuthMock {
  private currentUser: IUser = MOCK_USER;

  public async login(credentials: ILoginCredentials): Promise<IAuthResponse> {
    await delay();
    this.currentUser = { ...MOCK_USER, email: credentials.email };
    return { user: this.currentUser, token: MOCK_TOKEN };
  }

  public async register(
    credentials: IRegisterCredentials,
  ): Promise<IAuthResponse> {
    await delay();
    this.currentUser = {
      ...MOCK_USER,
      name: credentials.name,
      email: credentials.email,
    };
    return { user: this.currentUser, token: MOCK_TOKEN };
  }

  public async getCurrentUser(): Promise<IUser> {
    await delay();
    return this.currentUser;
  }

  public async logout(): Promise<void> {
    this.currentUser = MOCK_USER;
    await delay();
  }
}

export const authMock = new AuthMock();
