import {FormArray, FormControl, UntypedFormArray, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {TransformUtils} from './transform.utils';
import {ScrollUtils} from './scroll.utils';
import {FormControlErrors} from '../form/FormControlErrors';

export class FormUtils {
  static validateAllFormFields(formGroup: UntypedFormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof UntypedFormControl) {
        control.markAsTouched({onlySelf: true, emitEvent: true});
        control.markAsDirty({onlySelf: true, emitEvent: true});
        control.setValue(control.value);
      } else if (control instanceof UntypedFormGroup) {
        this.validateAllFormFields(control);
      } else if (control instanceof UntypedFormArray) {
        control.markAsTouched({onlySelf: true, emitEvent: true});
        control.markAsDirty({onlySelf: true, emitEvent: true});
        control.setValue(control.value);
        for (const data of control.controls) {
          data.markAsTouched({onlySelf: true, emitEvent: true});
          data.markAsDirty({onlySelf: true, emitEvent: true});
          control.setValue(control.value);
          if (data instanceof UntypedFormGroup) {
            this.validateAllFormFields(data);
          }
        }
      }
    });
  }

  static scrollToFirstInvalidControl(el: HTMLElement) {
    if (!el) {
      console.warn('HTMLElement is undefined in scrollToFirstInvalidControl');
      return;
    }
    const firstInvalidCtrl = el.querySelector('.ng-invalid.ng-touched.ng-dirty');
    if (firstInvalidCtrl instanceof HTMLElement) {
      firstInvalidCtrl.focus();
      ScrollUtils.scroll(firstInvalidCtrl);
    }
  }

  static isInvalid(formControl: FormControl | FormArray): boolean {
    return formControl.invalid && (formControl.dirty || formControl.touched);
  }

  static getErrorMessage(formControl: FormControl | FormArray, prefix: string = 'validation'): { messageKey: string, errorParams?: any} {
    return {
      messageKey: this.getOnlyErrorMessage(formControl, prefix),
      errorParams: formControl.errors ?? undefined
    }
  }

  private static getOnlyErrorMessage(formControl: FormControl | FormArray, prefix: string): string {
    const errors = TransformUtils.getEnumValues(FormControlErrors);
    for (const error of errors) {
      if (formControl.hasError(error)) {
        return `${prefix}.${error}`;
      }
    }
    if (formControl.hasError('openapiError')) {
      return `${prefix}.${formControl.getError('openapiError')}`;
    }
    return `${prefix}.default`;
  }
}
