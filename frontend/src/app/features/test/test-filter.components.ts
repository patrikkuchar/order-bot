import {Component, Input} from '@angular/core';
import {FormComponent} from '../../shared/components/form/wrapper/form/form.component';
import {fnAsObservable} from '../../shared/rxjs/fn-as-observable';
import {TestItemListFilter, TestItemListFilterCategoriesEnum} from '../../api';
import {InputTextComponent} from '../../shared/components/form/inputtext.component';
import {SelectComponent} from '../../shared/components/form/multiselect.component';
import {FormArray, FormControl} from '@angular/forms';
import {TransformUtils} from '../../shared/utils/transform.utils';
import {InputNumberComponent} from '../../shared/components/form/inputnumber.component';
import {CustomFormGroup} from '../../shared/form/custom/custom-form-group';

@Component({
  selector: 'app-test-filter',
  imports: [
    FormComponent,
    InputTextComponent,
    SelectComponent,
    InputNumberComponent
  ],
  template: `
    <app-form [form]="form" [onSubmit]="fnAsObservable(submitFn)" [resetOnSubmit]="false">
      <div class="flex flex-row gap-4 max-w-[55rem] w-auto">
        <form-inputtext id="title" [control]="form.controls.title" label="Title" />
        <form-multiselect id="categories" [array]="form.controls.categories" label="Categories" [options]="options"/>
        <form-inputnumber id="fromPrice" [control]="form.controls.priceRange.controls.from" label="From Price" />
        <form-inputnumber id="toPrice" [control]="form.controls.priceRange.controls.to" label="To Price" />
      </div>
    </app-form>
  `
})
export class TestFilterComponent {
  @Input() form: CustomFormGroup<TestItemListFilter>;
  @Input() submitFn: () => void;
  @Input() clearFilter: () => void;

  get categoriesArray(): FormArray<FormControl<any>> {
    return this.form.controls.categories as unknown as FormArray<FormControl<TestItemListFilterCategoriesEnum>>;
  }

  readonly options = TransformUtils.getEnumValuesAsEnum(TestItemListFilterCategoriesEnum);

  protected readonly fnAsObservable = fnAsObservable;
}
