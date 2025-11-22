import {CustomFormControl} from './custom/custom-form-controls';
import {Observable, of, switchMap, timer} from 'rxjs';
import {DEFAULT_TEXT_INPUT_DEBOUNCE_MS} from './form.consts';
import {AbstractControl, AsyncValidatorFn, ValidationErrors} from '@angular/forms';
import {catchError, map} from 'rxjs/operators';

export const createAsyncValidator = <T = unknown>(
  validatorFn: (value: T, control: CustomFormControl<T>) => Observable<boolean>,
  errorKey: string,
  debounceMs = DEFAULT_TEXT_INPUT_DEBOUNCE_MS
): AsyncValidatorFn => {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const customControl = control as CustomFormControl<T>;

    if (!customControl?.value) {
      return of(null);
    }

    return timer(debounceMs).pipe(
      switchMap(() => validatorFn(customControl.value as T, customControl)),
      map((isValid) => (isValid ? null : { [errorKey]: true })),
      catchError(() => of({ [errorKey]: true }))
    );
  };
}
