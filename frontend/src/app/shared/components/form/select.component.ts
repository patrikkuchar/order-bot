import {Component, DestroyRef, Input, OnInit} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {FormFieldComponent} from './wrapper/form-field/form-field.component';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseFormInput} from './BaseFormInput';
import {Select} from 'primeng/select';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {getTranslatedValuesForSelect, TranslatedValue} from './form-control.utils';
import {MyTranslateService} from '../../../core/services/my-translate.service';

@Component({
  selector: 'form-select',
  imports: [
    FormFieldComponent,
    ReactiveFormsModule,
    TranslatePipe,
    Select
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
      <p-select [inputId]="id"
                [id]="id"
                [formControl]="control"
                [loading]="loading"
                [attr.placeholder]="placeholder | translate"
                fluid
                [options]="formOptions"
                optionLabel="label"
                optionValue="value"/>
    </app-form-field>
  `
})
export class SelectComponent<T> extends BaseFormInput<T> implements OnInit {

  @Input() options: T[] = [];

  @Input() i18nPrefix?: string;

  formOptions: TranslatedValue<T>[] = [];

  loading: boolean = false;

  constructor(private destroyRef: DestroyRef,
              private translationSvc: MyTranslateService) {
    super();
  }

  ngOnInit() {
    this.computeOptions();
    if (this.loading$) {
      this.loading$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(loading => this.loading = loading);
    }
  }

  private computeOptions() {
    if (this.i18nPrefix) {
      this.formOptions = getTranslatedValuesForSelect(this.translationSvc, this.options, this.i18nPrefix);
    } else {
      this.formOptions = this.options.map(option => ({label: option as unknown as string, value: option}));
    }
  }
}
