import {FormControl, ValidatorFn} from '@angular/forms';
import {debounceTime, Observable, of} from 'rxjs';
import {map, startWith, distinctUntilChanged} from 'rxjs/operators';
import {CustomFormNode} from './custom-form-types';
import {FormFieldParams} from '../openapi/openapi-types';

// Use a more specific generic constraint to align with FormControl
export class CustomFormControl<T = any> extends FormControl implements CustomFormNode<T> {
  private _initialValue: T | null = null;
  private _trackChanges: boolean = false;
  private _previousValue: T | null = null;

  static create<R>(initialValue: R, params?: FormFieldParams, trackChanges: boolean = false): CustomFormControl<R> {
    const ctrl = new CustomFormControl<R>(initialValue, {
      validators: params?.validators ?? [],
      asyncValidators: params?.asyncValidators ?? []
    });
    ctrl._initialValue = initialValue ?? null;
    ctrl._trackChanges = trackChanges;
    ctrl._previousValue = initialValue ?? null;
    return ctrl;
  }

  // Set the current value as the initial value and mark as pristine
  setValueAsInitial(): void {
    const current = this.value as T;
    this._initialValue = current ?? null;
    // Emit current value to valueChanges subscribers
    this.setValue(current, { emitEvent: true });
    this.markAsPristine();
    this._previousValue = current ?? null;
  }

  // Safe equality check for primitives and objects. Uses JSON.stringify for objects
  // which is fine for typical form values (POJOs). If you need full correctness for
  // functions, Dates, Maps etc., consider injecting a deep-equal utility.
  private _isEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (a == null || b == null) return a === b;
    if (typeof a !== 'object' || typeof b !== 'object') return a === b;
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return false;
    }
  }

  registerFnOnValueChange(fn: (val: T) => any): void {
    this.valueChanges.pipe(debounceTime(300))
      .subscribe((value) => {
        if (this._isEqual(value, this._previousValue) || this.invalid) return;
        this._previousValue = value ?? null;
        if (value) fn(value);
      });
  }

  // Check if the value has changed from the initial value
  get isChanged(): boolean {
    if (!this._trackChanges) {
      return false;
    }
    // Use deep comparison for objects if needed, or strict equality for primitives
    return !this._isEqual(this.value, this._initialValue);
  }

  // Observable for tracking value changes
  get changed$(): Observable<boolean> {
    if (!this._trackChanges) {
      return of(false);
    }
    return this.valueChanges.pipe(
      startWith(this.value),
      map(value => !this._isEqual(value, this._initialValue)),
      distinctUntilChanged()
    );
  }

  getValue(): T {
    return this.value as T;
  }

  updateValue(value: T, emit: boolean): void {
    this.setValue(value, { emitEvent: emit });
    this._previousValue = value ?? null;
  }

  updateInitialValue(value: T): void {
    this.setValueAsInitial();
    this._previousValue = value ?? null;
  }

  // Reset to the initial value and clear changed state
  resetToInitial(): void {
    this.setValue(this._initialValue as any, {emitEvent: false});
    this.markAsPristine();
    this._previousValue = this._initialValue;
  }

  clearValue(emit: boolean): void {
    this.setValue(null as any, { emitEvent: emit });
    this.markAsPristine();
    this._previousValue = null;
  }

  // Override setValue to maintain compatibility with FormControl
  override setValue(value: T, options?: {
    onlySelf?: boolean;
    emitEvent?: boolean;
    emitModelToViewChange?: boolean;
    emitViewToModelChange?: boolean;
  }): void {
    super.setValue(value, options);
  }
}
