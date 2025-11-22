import {ErrorHandler, Injectable} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {ToastService} from '../services/toast.service';
import {ErrorNotificationHandler} from './ErrorNotifcationHandler';
import {RedirectService} from '../services/redirect.service';
import {AuthService} from '../services/auth.service';

@Injectable()
export class AppErrorsHandler implements ErrorHandler {

  constructor(
    private toastSvc: ToastService,
    private redirectSvc: RedirectService,
    private notification: ErrorNotificationHandler,
    private authSvc: AuthService
  ) {
  }

  handleError(err: Error | HttpErrorResponse | any) {
    // todo find out why HttpErrorResponse is wrapped in Error object
    // Server or connection error happened

    console.error('Error occurred', err);

    let error;
    if (err.rejection && err.rejection instanceof HttpErrorResponse) {
      error = err.rejection;
    } else {
      error = err;
    }

    if (error.status) {
      if (!navigator.onLine) {
        this.toastSvc.error('No internet connection');
        return;
      }

      if (error.status === 401) {
        this.redirectSvc.storeThis();
        this.authSvc.logout();
      }

      if (error.status === 403) {
        //TODO: think
      }

      this.showError(error.error);
    } else {
      this.showError(error);
    }
  }

  private showError(err: any) {
    this.notification.handleError(err);
  }
}
