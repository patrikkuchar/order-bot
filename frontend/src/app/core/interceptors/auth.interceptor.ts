import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {AuthService} from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let req = request.clone();

    const token = this.authService.getAuthToken();
    const isAuthPath = request.url.startsWith('/api/auth');
    if (token && !isAuthPath) {
      req = req.clone({
        withCredentials: true,
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(req).pipe(
      catchError((response) => {
        if (response instanceof HttpErrorResponse) {
          if (response.status === 401) {
            this.authService.logout();
          }
        }

        return throwError(response);
      })
    );
  }
}
