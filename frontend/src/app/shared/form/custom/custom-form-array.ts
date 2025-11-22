/* eslint-disable sonarjs/cognitive-complexity, complexity */
import {FormArray, AbstractControl, ValidatorFn} from '@angular/forms';
import {Observable, defer, merge, of} from 'rxjs';
import {distinctUntilChanged, map, startWith} from 'rxjs/operators';
import {CustomFormGroup} from './custom-form-group';
import {CustomFormControl} from './custom-form-controls';
import {ControlOf, FormFieldParams, OpenApiSchema} from '../openapi/openapi-types';
import {CustomFormNode, CustomFormType} from './custom-form-types';
import {CustomFormNodeData, enumerateCustomFormNodes} from './custom-form-helpers';

// Keep generic T as the item value type; the FormArray holds the control type produced by ControlOf<T>
export class CustomFormArray<T> extends FormArray<ControlOf<T>> implements CustomFormNode<T[]> {
  private _initialValue: T[] = [];
  private _trackChanges: boolean = false;

  static create<T>(controls: AbstractControl<T>[], params: FormFieldParams, trackChanges: boolean = false): CustomFormArray<T> {
    const array = new CustomFormArray<T>(
      controls as ControlOf<T>[],
      {
        validators: params.validators ?? [],
        asyncValidators: params.asyncValidators ?? []
      }
    );
    array._trackChanges = trackChanges;
    return array;
  }

  private _createControl: (item?: T) => CustomFormType<T> = (item?: T) =>
    CustomFormControl.create(item as any, undefined, this._trackChanges) as unknown as CustomFormType<T>;
  private _itemSchema?: OpenApiSchema;

  add(item?: T): void {
    const control = this._createControl(item);
    this.push(control as ControlOf<T>);
  }

  getValue(): T[] {
    return this.controls.map(ctrl => ctrl.value as T);
  }

  get isChanged(): boolean {
    if (!this._trackChanges) return false;

    if (this.length !== this._initialValue.length) return true;

    if (this.childForms.some(child => child.node.isChanged)) return true;

    const current = this.getValue();
    for (let i = 0; i < current.length; i++) {
      if (!this.areValuesEqual(current[i], this._initialValue[i])) {
        return true;
      }
    }
    return false;
  }

  get changed$(): Observable<boolean> {
    if (!this._trackChanges) return of(false);

    return defer(() => {
      const childStreams = this.childForms
        .map(child => child.node.changed$)
        .filter((stream): stream is Observable<boolean> => Boolean(stream));

      const streams: Observable<unknown>[] = [
        this.valueChanges
      ];

      streams.push(...childStreams);

      if (streams.length === 0) {
        return of(this.isChanged);
      }

      return merge(...streams).pipe(
        startWith(this.isChanged),
        map(() => this.isChanged),
        distinctUntilChanged()
      );
    });
  }

  updateValue(value: T[], emit: boolean): void {
    if (Array.isArray(value)) {
      this.syncLength(value.length);
      for (let i = 0; i < value.length; i++) {
        this.ensureAndUpdateAt(i, value[i], emit, false);
      }
    } else {
      for (const child of this.controls) {
        this.updateChildToEmpty(child as AbstractControl, emit, false);
      }
    }

    if (!emit) {
      this.updateValueAndValidity({ emitEvent: false });
    }
  }

  updateInitialValue(val: T[]): void {
    if (Array.isArray(val)) {
      this._initialValue = this.cloneValue(val);
      this.syncLength(val.length);
      for (let i = 0; i < val.length; i++) {
        this.ensureAndUpdateAt(i, val[i], false, true);
      }
    } else {
      this._initialValue = [];
      for (const child of this.controls) {
        this.updateChildToEmpty(child as AbstractControl, false, true);
      }
    }

    this.resetArrayState();
  }

  resetToInitial(): void {
    if (!Array.isArray(this._initialValue)) {
      this.clearValue(false);
      return;
    }

    const target = this._initialValue.length;
    this.syncLength(target);
    for (let i = 0; i < target; i++) {
      this.ensureAndUpdateAt(i, this._initialValue[i], false, false);
    }

    this.childForms.forEach(child => {
      try { child.node.resetToInitial(); } catch {}
    });

    this.resetArrayState();
  }

  clearValue(emit: boolean): void {
    this.childForms.forEach(child => {
      try { child.node.clearValue(emit); } catch {}
    });
    this.updateValue([], emit);
    this.resetArrayState();
  }

  private syncLength(targetLen: number): void {
    while (this.length > targetLen) {
      this.removeAt(this.length - 1);
    }
  }

  private ensureAndUpdateAt(index: number, value: T, emit: boolean, setAsInitial: boolean): void {
    let control = this.controls[index] as ControlOf<T>;
    if (!control) {
      control = this._createControl(value) as ControlOf<T>;
      this.insert(index, control);
    }
    this.applyToControl(control, value, emit, setAsInitial);
  }

  private applyToControl(control: AbstractControl, value: any, emit: boolean, setAsInitial: boolean): void {
    if (control instanceof CustomFormControl) {
      if (setAsInitial) {
        this.safeSetValue(control, value, emit);
        control.setValueAsInitial();
      } else {
        (control as CustomFormControl<any>).updateValue(value, emit);
      }
    } else if (control instanceof CustomFormGroup) {
      if (setAsInitial) {
        control.updateInitialValue(value ?? {});
      } else {
        control.updateValue(value ?? {}, emit);
      }
    } else if (control instanceof CustomFormArray) {
      if (setAsInitial) {
        control.updateInitialValue(Array.isArray(value) ? value : []);
      } else {
        control.updateValue(Array.isArray(value) ? value : [], emit);
      }
    } else {
      this.safeSetValue(control, value, emit);
    }

    this.clearErrors(control);
  }

  private updateChildToEmpty(child: AbstractControl, emit: boolean, setAsInitial: boolean): void {
    const defaultValue = this.defaultValueFor(child);
    this.applyToControl(child, defaultValue, emit, setAsInitial);
  }

  private resetArrayState(): void {
    this.clearErrors(this as unknown as AbstractControl);
  }

  private safeSetValue(control: AbstractControl, value: any, emit: boolean): void {
    try { control.setValue(value, { emitEvent: emit }); } catch {}
  }

  private defaultValueFor(control: AbstractControl): any {
    if (control instanceof CustomFormArray) return [];
    if (control instanceof CustomFormGroup) return {};
    return null;
  }

  private cloneValue(value: T[]): T[] {
    if (!Array.isArray(value)) return [];
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return [...value];
    }
  }

  private areValuesEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (a == null || b == null) return a === b;
    if (typeof a !== 'object' || typeof b !== 'object') return a === b;
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return false;
    }
  }

  private clearErrors(c: AbstractControl): void {
    try { c.setErrors(null); } catch {}
    try { c.markAsPristine(); } catch {}
    try { c.markAsUntouched(); } catch {}
  }

  private get childForms(): CustomFormNodeData[] {
    return enumerateCustomFormNodes(this.controls);
  }
}
