import { CustomFormControl } from '../custom/custom-form-controls';
import type { CustomFormArray } from '../custom/custom-form-array';
import type { CustomFormGroup } from '../custom/custom-form-group';
import type {AsyncValidatorFn, ValidatorFn} from '@angular/forms';
export interface OpenApiSchema {
  type?: string; // e.g., 'object', 'array'
  required?: string[];
  properties?: Record<string, OpenApiSchema>; // Recursive for nested
  items?: OpenApiSchema; // For arrays
  format?: string; // e.g., 'email', 'date'
  $ref?: string;
  description?: string;
  example?: string;
  pattern?: string;
  'x-localization-key'?: string;
  minimum?: number;
  maximum?: number;
  maxLength?: number;
  minLength?: number;
}

// Type mapping for Angular controls
export type ControlsOf<T> = {
  [K in keyof T]-?:  // Odstráni voliteľnosť, ale zachová hodnotu
  NonNullable<T[K]> extends (infer U)[]
    ? NonNullable<U> extends string | number | boolean
      ? CustomFormArray<NonNullable<U>>  // Zmenené: T = value type (primitíva), array drží CustomFormControl<U>[]
      : NonNullable<U> extends object
        ? CustomFormArray<CustomFormGroup<NonNullable<U>>>  // Zmenené: T = object type, array drží OpenApiFormGroup<U>[]
        : CustomFormArray<NonNullable<U>>  // Fallback pre iné non-object
    : NonNullable<T[K]> extends Set<infer U>
      ? NonNullable<U> extends string | number | boolean
        ? CustomFormArray<NonNullable<U>>  // Podobne zmenené
        : NonNullable<U> extends object
          ? CustomFormArray<CustomFormGroup<NonNullable<U>>>
          : CustomFormArray<NonNullable<U>>
      : NonNullable<T[K]> extends string | number | boolean
        ? CustomFormControl<NonNullable<T[K]>>
        : NonNullable<T[K]> extends object
          ? CustomFormGroup<NonNullable<T[K]>>
          : CustomFormControl<NonNullable<T[K]>>;
};

export type ControlOf<T> = ControlsOf<T>[keyof ControlsOf<T>];

export type FormFieldParams = {
  validators?: ValidatorFn[];
  asyncValidators?: AsyncValidatorFn[];
};
