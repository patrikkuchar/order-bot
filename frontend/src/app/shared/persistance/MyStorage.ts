//TODO: improve in separate file (time capsule, data fetcher, saving, pristupne iba cez observable)
import {OPENAPI_VERSION} from '../../../assets/config/openapi.schema';
import {ClockUtils} from '../utils/clock.utils';
import {Signal, signal} from '@angular/core';

interface StorageData<T> {
  version: string;
  expiryAt: number;
  data: T;
}

export class MyStorage<T> {
  constructor(
    private key: string,
    private storage: Storage,
    private expiryM: number = ClockUtils.ofDays(365)
  ) {
    this._data.set(this.get());
  }

  _data = signal<T | null>(null);

  get$: Signal<T | null> = this._data.asReadonly();

  get = (): T | null => {
    const res = this.getItem();
    if (!res) return null;

    if (res.version !== OPENAPI_VERSION
        || Date.now() >= res.expiryAt) {
      this.clear();
      return null;
    }

    return res.data;
  };

  save = (data: T): void => {
    this.storage.setItem(this.key, JSON.stringify({
      version: OPENAPI_VERSION,
      expiryAt: ClockUtils.addFromNowTimestamp(this.expiryM),
      data
    } as StorageData<T>));
    this._data.set(data);
  }

  clear = (): void => {
    this.storage.removeItem(this.key);
    this._data.set(null);
  }

  private getItem = (): StorageData<T> | null => {
    const res = this.storage.getItem(this.key);
    if (!res) return null;

    try {
      return JSON.parse(res) as StorageData<T>;
    } catch {
      return null;
    }
  }
}
