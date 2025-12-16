import {FormGroup} from '@angular/forms';
import {ControlsOf} from '../openapi/openapi-types';
import {CustomFormNode} from './custom-form-types';
import {Observable, defer, merge, of} from 'rxjs';
import {distinctUntilChanged, map, startWith} from 'rxjs/operators';
import {CustomFormNodeData, enumerateCustomFormNodes} from './custom-form-helpers';

export class CustomFormGroup<T> extends FormGroup<ControlsOf<T>> implements CustomFormNode<T> {
  private _initialValue: T | null = null;

  override patchValue(value: any, options?: Parameters<FormGroup['patchValue']>[1]): void {
    super.patchValue(value, options);
  }

  override setValue(value: any, options?: Parameters<FormGroup['setValue']>[1]): void {
    super.setValue(value, options);
  }

  override reset(value?: any, options?: Parameters<FormGroup['reset']>[1]): void {
    super.reset(value, options);
  }

  getValue(): T {
    return this.value as T;
  }

  get isChanged(): boolean {
    return this.childForms.some(child => child.node.isChanged);
  }

  get changed$(): Observable<boolean> {
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

  updateValue(value: T, emit: boolean): void {
    const payload = (value ?? {}) as T;
    try { this.patchValue(payload as any, { emitEvent: emit }); } catch {}

    this.childForms.forEach(child => {
      const childVal = (payload as any)?.[child.key];
      try { child.node.updateValue(childVal, emit); } catch (e) {
        console.error('CustomFormGroup.updateValue child updateValue failed', e, child.node);
      }
    });
  }

  // Custom function to update initial values recursively
  updateInitialValue(val: T): void {
    console.log('CustomFormGroup.updateInitialValue called', val);
    this._initialValue = this.cloneValue(val);

    // Update current value without emitting change events
    this.updateValue(val, false);

    // Iterate children and call updateInitialValue only when implemented
    this.childForms.forEach(child => {
      const propValue = (val as any)?.[child.key];
      const updater = (child.node as any)?.updateInitialValue;
      if (typeof updater !== 'function') {
        console.warn('CustomFormGroup.updateInitialValue skipping child without updateInitialValue', child.key, child.node);
        return;
      }
      try {
        updater.call(child.node, propValue);
      } catch (e){
        console.error('CustomFormGroup.updateInitialValue child updateInitialValue failed', e, child.node);
      }
    });

    this.markAsPristine();
    this.markAsUntouched();
  }

  resetToInitial(): void {
    if (this._initialValue != null) {
      this.updateValue(this._initialValue, false);
    }

    this.childForms.forEach(child => {
      try { child.node.resetToInitial(); } catch {}
    });

    this.markAsPristine();
    this.markAsUntouched();
  }

  clearValue(emit: boolean): void {
    this.childForms.forEach(child => {
      try { child.node.clearValue(emit); } catch {}
    });

    this.updateValueAndValidity({ emitEvent: emit });

    this.markAsPristine();
    this.markAsUntouched();
  }

  private get childForms(): CustomFormNodeData[] {
    return enumerateCustomFormNodes(this.controls);
  }

  private cloneValue(value: T): T | null {
    if (value == null) return null;
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return { ...(value as any) };
    }
  }
}
