import {Injectable} from '@angular/core';
import {ToastService} from '../services/toast.service';
import {ApiErrorRes, ApiErrors} from './api-errors';
import {TranslateUtils} from '../../shared/utils/translate.utils';
import {MyTranslateService} from '../services/my-translate.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorNotificationHandler {

  constructor(private toastSvc: ToastService,
              private translateSvc: MyTranslateService) {}

  handleError(error: any): void {
    console.log('Handling error', error);
    if (this.isApiError(error)) {
      this.handleApiError(error as ApiErrorRes);
    } else {
      this.toastSvc.show(TranslateUtils.toastCmdBy('global.error', 'error'));
    }
  }

  private handleApiError(error: ApiErrorRes): void {
    const apiPrefix = 'apiErrors';
    const stringVal = this.translateSvc.getBy<string>(`${apiPrefix}.${error.code}`, 'string');
    console.log(stringVal);
    if (stringVal) {
      this.toastSvc.error(`${apiPrefix}.${error.code}`, 'error');
      return;
    }

    this.toastSvc.show(TranslateUtils.toastCmdBy(`${apiPrefix}.${error.code}`, 'error'));
  }

  private isApiError(error: any): error is ApiErrorRes {
    return 'code' in error && 'message' in error
      && ApiErrors.includes(error.code)
  }
}
