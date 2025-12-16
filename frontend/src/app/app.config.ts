import {
  ApplicationConfig,
  ErrorHandler, NgZone
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {providePrimeNG} from 'primeng/config';
import {MyPreset} from '../assets/config/primeng.themepreset';
import {MessageService} from 'primeng/api';
import {provideAnimations} from '@angular/platform-browser/animations';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {AuthInterceptor} from './core/interceptors/auth.interceptor';
import {NullifyEmptyStringsInterceptor} from './core/interceptors/nullify-empty-strings.interceptor';
import {AppErrorsHandler} from './core/handlers/AppErrorsHandler';
import {provideTranslateHttpLoader} from '@ngx-translate/http-loader';
import {provideTranslateService} from '@ngx-translate/core';
import {GlobalLoadingInterceptor} from './core/interceptors/global-loading.interceptor';
import {ConfirmationService} from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    providePrimeNG({
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: '.dark-mode-toggle'
        }
      }
    }),
    provideRouter(routes),

    // HTTP client
    provideHttpClient(withInterceptorsFromDi()),

    // interceptors
    { provide: HTTP_INTERCEPTORS, useClass: GlobalLoadingInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: NullifyEmptyStringsInterceptor, multi: true },

    // error handler
    { provide: ErrorHandler, useClass: AppErrorsHandler },

    // Translate: provide service + loader
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json?cb=' + new Date().getTime()
      }),
      fallbackLang: 'sk',  // napr. fallback
      defaultLanguage: 'sk'    // ak chceš mať default
    }),

    MessageService,
    ConfirmationService
  ],
};
