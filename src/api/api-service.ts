import type { IApiError } from "@/types/shared";

class ApiService {
  private apiMode = import.meta.env.VITE_API_MODE || "mock";
  private apiUrl = import.meta.env.VITE_API_URL;
  private token: string | undefined = undefined;

  public get isMockMode(): boolean {
    return this.apiMode === "mock";
  }

  /** Save JWT token (called after successful login) */
  public setToken(token: string): void {
    this.token = token;
  }

  public getToken(): string | undefined {
    return this.token;
  }

  /** Clear JWT token (called on logout) */
  public clearToken(): void {
    this.token = undefined;
  }

  public async send<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const result = await fetch(`${this.apiUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!result.ok) {
      const error: IApiError = await result.json().catch(() => ({
        success: false as const,
        status: result.status,
        message: result.statusText,
      }));

      throw error;
    }

    return result.json();
  }
}

export const apiService = new ApiService();
