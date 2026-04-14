import { MAX_RETRIES } from "@/constants/api";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { storageService } from "@/services/storage-service";
import type { IApiError } from "@/types/shared";
import { i18n } from "@/services/localization-service.ts";

class ApiService {
  private apiMode = import.meta.env.VITE_API_MODE || "mock";
  private apiUrl = import.meta.env.VITE_API_URL;
  private token: string | undefined =
    storageService.getStorage<string>(STORAGE_KEYS.TOKEN, "") || undefined;

  public get isMockMode(): boolean {
    return this.apiMode === "mock";
  }

  /** Save JWT token (called after successful login) */
  public setToken(token: string): void {
    storageService.setStorage(STORAGE_KEYS.TOKEN, token);
    this.token = token;
  }

  public getToken(): string | undefined {
    return this.token;
  }

  /** Clear JWT token (called on logout) */
  public clearToken(): void {
    storageService.removeStorage(STORAGE_KEYS.TOKEN);
    this.token = undefined;
  }

  public async send<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const request = this.prepareRequest(options);

    const result = await this.fetchWithRetry(
      `${this.apiUrl}${endpoint}`,
      request,
    );

    if (!result.ok) await this.handleError(result);

    const data = await result.json();

    if (!data.success) {
      throw {
        success: false,
        status: data.status ?? result.status,
        message: data.message ?? i18n.t().common.error.unknown_api_error,
      } satisfies IApiError;
    }
    return data;
  }

  public async sendStream(
    endpoint: string,
    options: RequestInit = {},
    signal?: AbortSignal,
  ): Promise<ReadableStream<Uint8Array> | undefined> {
    const effectiveSignal = signal ?? options.signal ?? undefined;
    const request = this.prepareRequest(options, effectiveSignal);

    try {
      const result = await fetch(`${this.apiUrl}${endpoint}`, request);

      if (!result.ok) await this.handleError(result);

      return result.body ?? undefined;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") throw error;

      throw {
        success: false,
        status: 0,
        message: i18n.t().common.error.network_error,
      } as IApiError;
    }
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

  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    maxRetries = MAX_RETRIES,
  ): Promise<Response> {
    let lastError: unknown;
    const isGet = !options.method || options.method === "GET";

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);

        if (!response.ok && response.status >= 500 && isGet) {
          if (attempt === maxRetries) return response;

          console.warn(`Retrying request to ${url} (attempt ${attempt + 1})`);
          await new Promise((resolve) =>
            setTimeout(resolve, 500 * (attempt + 1)),
          );
          continue;
        }
        return response;
      } catch (error) {
        lastError = error;
        if (attempt === maxRetries) break;

        console.warn(
          `Network error. Retrying request to ${url} (attempt ${attempt + 1})`,
        );
        await new Promise((resolve) =>
          setTimeout(resolve, 500 * (attempt + 1)),
        );
      }
    }

    if (lastError instanceof Error && lastError.name === "AbortError") {
      throw lastError;
    }

    throw {
      success: false,
      status: 0,
      message: i18n.t().common.error.network_error,
    } as IApiError;
  }

  private async handleError(result: Response): Promise<void> {
    const error: IApiError = await result.json().catch(() => ({
      success: false as const,
      status: result.status,
      message: result.statusText,
    }));

    if (result.status === 401 && this.token) {
      this.clearToken();
      globalThis.dispatchEvent(new Event("auth:logout"));
    }

    throw error;
  }
}

export const apiService = new ApiService();
