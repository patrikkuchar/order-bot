import {computed, Injectable, signal, Signal} from '@angular/core';
import {ConfigApi, ConfigurationResEnabledDomainsEnum} from '../../api';
import {firstValueFrom, ReplaySubject} from 'rxjs';

const DEFAULT_RELOAD_INTERVAL_MS = 10_000;

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  private _configLoadedSubject = new ReplaySubject<void>(1);

  private _enabledDomains = signal<ConfigurationResEnabledDomainsEnum[]>([]);
  private _nextCallTimeoutMs = DEFAULT_RELOAD_INTERVAL_MS;

  version: string;

  constructor(private api: ConfigApi) {
    const config = () => {
      this.loadConfig().finally(() => {
        setTimeout(config, this._nextCallTimeoutMs);
      });
    }
    config();
  }

  afterConfigLoaded(): Promise<void> {
    return firstValueFrom(this._configLoadedSubject.asObservable());
  }

  isEnabledDomain(domain: ConfigurationResEnabledDomainsEnum): Signal<boolean> {
    return computed(() => this.isDomainEnabled(domain));
  }

  isDomainEnabled(domain: ConfigurationResEnabledDomainsEnum): boolean {
    return this._enabledDomains().includes(domain);
  }

  reload(): void {
    this.loadConfig();
  }

  private loadConfig(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.api.getConfig().subscribe({
        next: res => {
          this._enabledDomains.set(res.enabledDomains);
          this.version = res.appVersion;
          this._nextCallTimeoutMs = res.reloadIntervalMs;
          this._configLoadedSubject.next();
          resolve();
        },
        error: err => {
          this._nextCallTimeoutMs = DEFAULT_RELOAD_INTERVAL_MS;
          reject(err);
        }
      });
    });
  }
}
