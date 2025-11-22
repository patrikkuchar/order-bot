import {Injectable, signal, Signal} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppSettingsService {
  //TODO: features management, etc. calls app settings endpoint
  // (one for logged in and one for anonymous users), change after every login/logout all with signals

  locale: Signal<string> = signal('sk-SK');
  currency: Signal<string> = signal('EUR');
}
