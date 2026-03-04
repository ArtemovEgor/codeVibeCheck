import type { StorageKey } from "@/constants/storage-keys";

class StorageService {
  public getStorage<T>(key: StorageKey): T {
    return JSON.parse(localStorage.getItem(key) ?? "{}");
  }

  public setStorage<T>(key: StorageKey, data: T): void {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

export const storageService = new StorageService();
