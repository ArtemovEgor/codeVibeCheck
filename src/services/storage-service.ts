import type { StorageKey } from "@/constants/storage-keys";

class StorageService {
  public getStorage<T>(key: StorageKey, defaultValue: T): T {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  }

  public setStorage<T>(key: StorageKey, data: T): void {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

export const storageService = new StorageService();
