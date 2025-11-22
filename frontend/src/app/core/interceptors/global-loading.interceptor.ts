import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {finalize, Observable} from 'rxjs';
import {LoadingService} from '../services/loading.service';

@Injectable()
export class GlobalLoadingInterceptor implements HttpInterceptor {

  constructor(private svc: LoadingService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const loadingId = this.svc.show();
    return next.handle(req).pipe(
      finalize(() => this.svc.hide(loadingId))
    );
  }
}
