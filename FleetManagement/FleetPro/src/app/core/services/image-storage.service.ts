import { Injectable } from '@angular/core';

export interface StoredImageRecord {
  id: string;
  name: string;
  type: string;
  size: number;
  createdAt: string;
  file: Blob | File;
}

@Injectable({
  providedIn: 'root'
})
export class ImageStorageService {
  private readonly dbName = 'FleetPro_DailyLog_DB';
  private readonly storeName = 'pending_images';
  private readonly dbVersion = 1;
  private dbInstance: IDBDatabase | null = null;

  /**
   * Initialize or retrieve the active IndexedDB instance.
   */
  private async getDB(): Promise<IDBDatabase> {
    if (this.dbInstance) {
      return this.dbInstance;
    }

    return new Promise<IDBDatabase>((resolve, reject) => {
      if (typeof window === 'undefined' || !('indexedDB' in window)) {
        reject(new Error('IndexedDB is not supported in this environment.'));
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };

      request.onsuccess = (event: Event) => {
        this.dbInstance = (event.target as IDBOpenDBRequest).result;
        resolve(this.dbInstance);
      };

      request.onerror = (event: Event) => {
        const error = (event.target as IDBOpenDBRequest).error;
        console.error('IndexedDB open error:', error);
        reject(error || new Error('Failed to open IndexedDB.'));
      };

      request.onblocked = () => {
        console.warn('IndexedDB database open blocked. Please close other open tabs of this application.');
      };
    });
  }

  /**
   * Save a single image record in IndexedDB.
   */
  async saveImage(record: StoredImageRecord): Promise<void> {
    const db = await this.getDB();
    return new Promise<void>((resolve, reject) => {
      try {
        const tx = db.transaction([this.storeName], 'readwrite');
        const store = tx.objectStore(this.storeName);
        const request = store.put(record);

        request.onsuccess = () => resolve();
        request.onerror = (e) => reject((e.target as IDBRequest).error);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Save multiple image records in IndexedDB in a single transaction.
   */
  async saveImages(records: StoredImageRecord[]): Promise<void> {
    if (!records || records.length === 0) return;
    const db = await this.getDB();
    return new Promise<void>((resolve, reject) => {
      try {
        const tx = db.transaction([this.storeName], 'readwrite');
        const store = tx.objectStore(this.storeName);

        records.forEach((record) => {
          store.put(record);
        });

        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject((e.target as IDBTransaction).error);
        tx.onabort = (e) => reject((e.target as IDBTransaction).error);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Retrieve all pending images from IndexedDB.
   */
  async getAllImages(): Promise<StoredImageRecord[]> {
    const db = await this.getDB();
    return new Promise<StoredImageRecord[]>((resolve, reject) => {
      try {
        const tx = db.transaction([this.storeName], 'readonly');
        const store = tx.objectStore(this.storeName);
        const request = store.getAll();

        request.onsuccess = () => {
          resolve(request.result || []);
        };
        request.onerror = (e) => reject((e.target as IDBRequest).error);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Retrieve an image by its unique ID.
   */
  async getImageById(id: string): Promise<StoredImageRecord | undefined> {
    const db = await this.getDB();
    return new Promise<StoredImageRecord | undefined>((resolve, reject) => {
      try {
        const tx = db.transaction([this.storeName], 'readonly');
        const store = tx.objectStore(this.storeName);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject((e.target as IDBRequest).error);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Delete an image by its unique ID from IndexedDB.
   */
  async deleteImage(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise<void>((resolve, reject) => {
      try {
        const tx = db.transaction([this.storeName], 'readwrite');
        const store = tx.objectStore(this.storeName);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = (e) => reject((e.target as IDBRequest).error);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Clear all pending images from IndexedDB.
   */
  async clearAllImages(): Promise<void> {
    const db = await this.getDB();
    return new Promise<void>((resolve, reject) => {
      try {
        const tx = db.transaction([this.storeName], 'readwrite');
        const store = tx.objectStore(this.storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = (e) => reject((e.target as IDBRequest).error);
      } catch (err) {
        reject(err);
      }
    });
  }
}
