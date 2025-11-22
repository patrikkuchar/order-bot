import {Component, DestroyRef, Input, OnInit} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {FormFieldComponent} from './wrapper/form-field/form-field.component';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseFormInput} from './BaseFormInput';
import {Select} from 'primeng/select';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

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
                [options]="options"
                [optionLabel]="optionLabel"
                [optionValue]="optionValue"/>
    </app-form-field>
  `
})
export class SelectComponent<T> extends BaseFormInput<T> implements OnInit {

  @Input() options: T[] = [];
  @Input() optionLabel?: string;
  @Input() optionValue?: string;

  loading: boolean = false;

  constructor(private destroyRef: DestroyRef) {
    super();
  }

  ngOnInit() {
    if (this.loading$) {
      this.loading$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(loading => this.loading = loading);
    }
  }
}
