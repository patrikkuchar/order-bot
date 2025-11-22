import {Directive, Input, OnInit} from '@angular/core';
import {DestroyableDirective} from '../../../../directives/destroyable.directive';
import {CustomFormArray} from '../../../../form/custom/custom-form-array';
import {CustomFormControl} from '../../../../form/custom/custom-form-controls';
import {ControlOf} from '../../../../form/openapi/openapi-types'; // Pridajte tento import, ak nie je už (z types.ts)
@Directive()
export class FormArrayDirective<T> extends DestroyableDirective implements OnInit {
  @Input({required: true}) array!: CustomFormArray<T>;

  selectedValues: T[] = [];

  ngOnInit() {
    if (!this.array) return;
    this.selectedValues = this.array.getValue();
    this.array.valueChanges
      .pipe(this.untilDestroy())
      .subscribe(values => this.selectedValues = values as T[]);
  }

  protected valueChanged() {
    const values: T[] = this.selectedValues || [];

    this.array.updateValue(values, true);
  }
}
