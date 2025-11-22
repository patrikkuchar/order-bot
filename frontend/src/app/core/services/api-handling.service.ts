import {Injectable} from '@angular/core';
import {ToastService} from './toast.service';
import {RedirectService} from './redirect.service';
import {Observer} from 'rxjs';
import {ApiErrorCode} from '../handlers/api-errors';
import {RouteArgs, RoutePath} from '../../app/routes/types';

@Injectable({
  providedIn: 'root'
})
export class ApiHandlingService {

  constructor(private notificationSvc: ToastService,
              private redirectSvc: RedirectService) { }

  handle = <T>(opts: {
    successMsg?: string,
    onSuccess?: (data: T) => void,
    silentSuccess?: boolean,
    mappedErrors?: Record<ApiErrorCode, string | (() => void)>,
    redirect?: (data: T) => RouteArgs<RoutePath> | RoutePath,
    finalize?: () => void,

  }): Observer<T> => ({
    next: (data: T) => {
      if (!opts.silentSuccess)
        this.notificationSvc.success(opts.successMsg ?? 'successMessage');
      opts.onSuccess?.(data);
      if (opts.redirect) {
        const routeArgs = opts.redirect(data);
        if (typeof routeArgs === 'function') {
          this.redirectSvc.to(routeArgs, undefined);
        } else {
          this.redirectSvc.to(routeArgs.pathFn, undefined, ...(routeArgs.args ?? []));
        }
      }
    },
    error: (err) => {
      const errCode = err?.error?.code as ApiErrorCode | undefined;
      opts.finalize?.();
      if (errCode && opts.mappedErrors && opts.mappedErrors[errCode]) {
        this.handleMappedError(opts.mappedErrors[errCode]);
      } else {
        throw err;
      }
    },
    complete: () => opts.finalize?.()
  });

  private handleMappedError(err: string | (() => void)): void {
    if (typeof err === 'string')
      this.notificationSvc.error(err);
    else
      err();
  }
}
