import {AbstractControl, AsyncValidatorFn, ValidatorFn, Validators} from '@angular/forms';
import { OpenApiSchema, ControlsOf, FormFieldParams } from './openapi-types';
import {CustomFormArray} from '../custom/custom-form-array';
import {CustomFormControl} from '../custom/custom-form-controls';
import {OPENAPI_SCHEMA} from '../../../../assets/config/openapi.schema';
import {CustomFormGroup} from '../custom/custom-form-group';

export const buildForm = <T>(
  spec: OpenApiSchema,
  fields: Partial<Record<keyof T, FormFieldParams>> = {},
  initialData: Partial<T> = {},
  trackFormChanges: boolean = false,
  definitions: Record<string, OpenApiSchema> = OPENAPI_SCHEMA
): CustomFormGroup<T> => {
  // Helper to resolve $ref
  function resolveRef(schema: OpenApiSchema): OpenApiSchema {
    if (schema.$ref && definitions) {
      // $ref is usually like '#/components/schemas/SomeType' or '#/definitions/SomeType'
      const ref = schema.$ref.replace(/^#\/(components\/schemas|definitions)\//, '');
      const resolved = definitions[ref];
      if (!resolved) throw new Error(`Schema $ref not found: ${schema.$ref}`);
      return resolved;
    }
    return schema;
  }

  const controls = {} as ControlsOf<T>;

  console.log('Building form for spec:', spec, 'with initial data:', initialData);
  Object.entries(spec.properties || {}).forEach(([name, propSpec]) => {
    let control: AbstractControl;

    // Resolve $ref if present
    propSpec = resolveRef(propSpec);

    // Get validators
    const validatorParams = {
      validators: setValidators(propSpec, name, spec),
      asyncValidators: [] as AsyncValidatorFn[]
    } as FormFieldParams;

    // Add custom from fields
    const fieldSpec = fields[name as keyof T];
    if (fieldSpec) {
      if (fieldSpec.validators) validatorParams.validators!.push(...fieldSpec.validators);
      if (fieldSpec.asyncValidators) validatorParams.asyncValidators!.push(...fieldSpec.asyncValidators);
    }

    // Initial value
    const initialValue = initialData[name as keyof T] ?? getDefaultValue(propSpec.type);

    const createArrayControl = (arrayItemsSpec: OpenApiSchema): CustomFormArray<any> => {
      // Resolve $ref in items
      const itemSpec = resolveRef(arrayItemsSpec);

      // Convert Set to Array if needed
      const arrValue: any[] = Array.isArray(initialValue)
        ? initialValue
        : (initialValue as any) instanceof Set
          ? Array.from(initialValue as any)
          : [];

      const createObject = (): CustomFormArray<any> => {
        const arr = arrValue.map(item =>
          buildForm<any>(itemSpec, {}, item, trackFormChanges, definitions)
        );
        const formArray = CustomFormArray.create(arr, validatorParams);
        // attach factory so we can later create controls for new items (used in updateInitialValue)
        (formArray as any)._createControl = (item?: any) => buildForm(itemSpec, {}, item, trackFormChanges, definitions);
        // store item schema as well so fallback can create groups if needed
        (formArray as any)._itemSchema = itemSpec;
        return formArray;
      }

      const createPrimitive = (): CustomFormArray<any> => {
        const arr = arrValue.map(item =>
          CustomFormControl.create(item, validatorParams, trackFormChanges)
        );
        // Array of primitives (support null in items)
        const formArray = new CustomFormArray<any>(arr, validatorParams);
        (formArray as any)._createControl = (item?: any) => CustomFormControl.create(item, validatorParams, trackFormChanges);
        (formArray as any)._itemSchema = itemSpec;
        return formArray;
      }

      if (itemSpec.type === 'object' && itemSpec.properties) return createObject();
      else if (itemSpec.type === 'array' && itemSpec.items) return createArrayControl(itemSpec.items);
      return createPrimitive();
    }

    // Handle nested or array
    if (propSpec.type === 'object' && propSpec.properties) {
      control = buildForm(propSpec, {}, initialValue, trackFormChanges, definitions); // Recursive
    } else if (propSpec.type === 'array' && propSpec.items) {
      control = createArrayControl(propSpec.items);
    } else {
      control = CustomFormControl.create(initialValue, validatorParams, trackFormChanges);
    }

    (controls as any)[name] = control;
  });

  return new CustomFormGroup<T>(controls);
};

const setValidators = (propSpec: OpenApiSchema, propName: string, parentSpec: OpenApiSchema): ValidatorFn[] => {
  const requiredFields = new Set(parentSpec.required || []);
  // Get validators
  const validators: ValidatorFn[] = [];

  //required
  if (requiredFields.has(propName)) validators.push(Validators.required);

  //custom format validators
  if (propSpec.pattern) {
    validators.push((control: AbstractControl) => {
      const pattern = new RegExp(propSpec.pattern!);
      if (control.value == null || pattern.test(control.value)) return null;
      return { openapiError: propSpec['x-localization-key'] };
    });
  }

  //min and max for numbers
  if (propSpec.type === 'number' || propSpec.type === 'integer') {
    if (propSpec.minimum !== undefined) validators.push(Validators.min(propSpec.minimum));
    if (propSpec.maximum !== undefined) validators.push(Validators.max(propSpec.maximum));
  }

  //minLength and maxLength for strings
  if (propSpec.type === 'string') {
    if (propSpec.minLength !== undefined) validators.push(Validators.minLength(propSpec.minLength));
    if (propSpec.maxLength !== undefined) validators.push(Validators.maxLength(propSpec.maxLength));
  }

  return validators;
};

const getDefaultValue = (type?: string): any => {
  switch (type) {
    case 'number':
    case 'integer': return null;
    case 'boolean': return false;
    case 'array': return [];
    case 'object': return {};
    default: return null; // Updated to default to null for strings/objects to support null
  }
};
