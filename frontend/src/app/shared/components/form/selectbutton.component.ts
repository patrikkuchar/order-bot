import {Component, DestroyRef, Input, OnInit} from '@angular/core';
import {BaseFormInput} from './BaseFormInput';
import {FormFieldComponent} from './wrapper/form-field/form-field.component';
import {TranslatePipe} from '@ngx-translate/core';
import {SelectButton} from 'primeng/selectbutton';
import {getTranslatedValuesForSelect, TranslatedValue} from './form-control.utils';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MyTranslateService} from '../../../core/services/my-translate.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {filter} from 'rxjs';

@Component({
  selector: 'form-selectbutton',
  imports: [
    FormFieldComponent,
    TranslatePipe,
    SelectButton,
    ReactiveFormsModule,
    FormsModule

  ],
  template: `
    <app-form-field #appForm
                    [forId]="id"
                    [control]="control"
                    [label]="label"
                    [helpText]="helpText"
                    [tooltip]="tooltip"
                    [floatLabel]="floatLabel"
                    [inftaLabel]="inftaLabel"
                    [showChanges]="showChanges"
                    [showErrors]="showErrors"
                    [loading$]="loading$">
      <p-select-button
                [id]="id"
                [(ngModel)]="selectedValue"
                (ngModelChange)="valueChanged()"
                [attr.placeholder]="placeholder | translate"
                [options]="formOptions"
                optionLabel="label"
                optionValue="value"
                [invalid]="invalid"
      />
    </app-form-field>
  `
})
export class SelectButtonComponent<T> extends BaseFormInput<T> implements OnInit {

  @Input() options: T[] = [];
  @Input() emptyOption: T;

  @Input() i18nPrefix?: string;

  formOptions: TranslatedValue<T>[] = [];

  selectedValue: T | null;

  invalid = false;

  constructor(private destroyRef: DestroyRef,
              private translationSvc: MyTranslateService) {
    super();
  }

  ngOnInit() {
    this.computeOptions();
    this.control.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(val => val !== this.selectedValue)
        )
      .subscribe(value => this.selectedValue = value);
    this.control.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(status => this.invalid = status === 'INVALID');
    this.selectedValue = this.control.getValue();
  }

  valueChanged() {
    if (!this.selectedValue && this.emptyOption) {
      this.selectedValue = this.emptyOption;
    }
    this.control.setValue(this.selectedValue!, { emitEvent: true });
  }

  private computeOptions() {
    if (this.i18nPrefix) {
      this.formOptions = getTranslatedValuesForSelect(this.translationSvc, this.options, this.i18nPrefix);
    } else {
      this.formOptions = this.options.map(option => ({label: option as unknown as string, value: option}));
    }
  }
}
