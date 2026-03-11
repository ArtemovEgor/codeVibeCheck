import { TOKEN_KEY } from "@/constants/app";
import { EN } from "@/locale/en";
import type { IApiError } from "@/types/shared";

class ApiService {
  private apiMode = import.meta.env.VITE_API_MODE || "mock";
  private apiUrl = import.meta.env.VITE_API_URL;
  private token: string | undefined =
    localStorage.getItem(TOKEN_KEY) ?? undefined;

  public get isMockMode(): boolean {
    return this.apiMode === "mock";
  }

  /** Save JWT token (called after successful login) */
  public setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this.token = token;
  }

  public getToken(): string | undefined {
    return this.token;
  }

  /** Clear JWT token (called on logout) */
  public clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.token = undefined;
  }

  public async send<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const request = this.prepareRequest(options);

    const result = await fetch(`${this.apiUrl}${endpoint}`, request);

    if (!result.ok) await this.handleError(result);

    const data = await result.json();

    if (!data.success) {
      throw {
        success: false,
        status: data.status ?? result.status,
        message: data.message ?? EN.common.error.unknown_api_error,
      } satisfies IApiError;
    }
    return data;
  }

  public async sendStream(
    endpoint: string,
    options: RequestInit = {},
    signal?: AbortSignal,
  ): Promise<ReadableStream<Uint8Array> | undefined> {
    const request = this.prepareRequest(options, signal);

    const result = await fetch(`${this.apiUrl}${endpoint}`, request);

    if (!result.ok) await this.handleError(result);

    return result.body ?? undefined;
  }

  private prepareRequest(
    options: RequestInit = {},
    signal?: AbortSignal,
  ): RequestInit {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (options.body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return {
      ...options,
      headers,
      signal,
    };
  }

  private async handleError(result: Response): Promise<void> {
    const error: IApiError = await result.json().catch(() => ({
      success: false as const,
      status: result.status,
      message: result.statusText,
    }));

    throw error;
  }
}

export const apiService = new ApiService();
