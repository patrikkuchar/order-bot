import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import {TransformUtils} from '../../shared/utils/transform.utils';

@Injectable()
export class NullifyEmptyStringsInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.body && typeof req.body === 'object'
      && !(req.body instanceof FormData)) {
      const transformedBody = TransformUtils.transformEmptyStringsToNull(req.body);
      const modifiedReq = req.clone({ body: transformedBody });
      return next.handle(modifiedReq);
    }
    return next.handle(req);
  }
}
