import type {CustomFormArray} from './custom-form-array';
import type {CustomFormGroup} from './custom-form-group';
import type {CustomFormControl} from './custom-form-controls';
import type {Observable} from 'rxjs';

export type CustomFormType<T> = CustomFormArray<T> | CustomFormGroup<T> | CustomFormControl<T>;

export interface CustomFormNode<T> {

  getValue(): T;

  isChanged: boolean;

  changed$: Observable<boolean>;

  updateValue(value: T, emit: boolean): void;

  updateInitialValue(value: T): void;

  resetToInitial(): void;

  clearValue(emit: boolean): void;

}
