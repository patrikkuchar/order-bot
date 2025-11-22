import {Component, computed, Signal} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Toast} from 'primeng/toast';
import {AuthService} from './core/services/auth.service';
import {CoreModule} from './core/core.module';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ToastService} from './core/services/toast.service';
import {TestApi} from './api';
import {LoadingService} from './core/services/loading.service';
import {ProgressSpinner} from 'primeng/progressspinner';
import {SpinnerComponent} from './shared/components/spinner.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CoreModule, Toast, ProgressSpinner, SpinnerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  protected title = 'my-template';
  readonly showLoading: Signal<boolean>;

  constructor(authSvc: AuthService, toastSvc: ToastService, api: TestApi, loadingSvc: LoadingService) {
    this.showLoading = computed(() => loadingSvc.showLoading());

    authSvc.restoreSession();

    authSvc.isLoggedIn
      .pipe(takeUntilDestroyed())
      .subscribe(isLoggedIn => {
        if (isLoggedIn) {
          if (authSvc.isAdmin()) {
            api.adminPing().subscribe(res => {
              toastSvc.info(`Dobrý deň ${res.userFullName}, ste admin - ${res.isAdmin}`, 'Volanie admin api');
            });
          } else {
            api.ping().subscribe(res => {
              toastSvc.info(`Dobrý deň ${res.userFullName}, nie ste admin - ${res.isAdmin}`, 'Volanie user api');
            });
          }
        }
      })
  }
}
