import {computed, Injectable, signal, Signal} from '@angular/core';
import {MyStorage} from '../../shared/persistance/MyStorage';
import {ClockUtils} from '../../shared/utils/clock.utils';

interface DarkMode {
  enabled: boolean;
}

const ENABLED = {
  enabled: true
} as DarkMode;

const DISABLED = {
  enabled: false
} as DarkMode;

@Injectable({
  providedIn: 'root'
})
export class DarkModeService {

  private storage = new MyStorage<DarkMode>('darkMode', localStorage);
  private html = document.documentElement;  // <html>

  isDarkModeEnabled: Signal<boolean> = computed(
    () => this.storage.get$()?.enabled ?? false
  );

  constructor() {
    const persisted = this.storage.get();
    if (persisted?.enabled) {
      this.dark();
    } else {
      this.light();
    }
  }

  toggle(): void {
    if (this.isSetAsEnabledByDom()) {
      this.light();
    } else {
      this.dark();
    }
  }

  dark(): void {
    this.html.classList.add('dark-mode-toggle');
    this.storage.save(ENABLED);
  }

  light(): void {
    this.html.classList.remove('dark-mode-toggle');
    this.storage.save(DISABLED);
  }

  private isSetAsEnabledByDom(): boolean {
    return this.html.classList.contains('dark-mode-toggle');
  }
}
