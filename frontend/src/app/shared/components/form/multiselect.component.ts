import {Component, DestroyRef, Input, OnInit} from '@angular/core';
import {FormFieldComponent} from './wrapper/form-field/form-field.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {FormArrayDirective} from './wrapper/form-array/form-array.directive';
import {Observable} from 'rxjs';
import {MultiSelect} from 'primeng/multiselect';
import {CustomFormControl} from '../../form/custom/custom-form-controls';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'form-multiselect',
  imports: [
    FormFieldComponent,
    ReactiveFormsModule,
    TranslatePipe,
    MultiSelect,
    FormsModule
  ],
  template: `
    <app-form-field #appForm
                              [forId]="id"
                              [control]="array"
                              [label]="label"
                              [helpText]="helpText"
                              [tooltip]="tooltip"
                              [floatLabel]="floatLabel"
                              [inftaLabel]="inftaLabel"
                              [showChanges]="showChanges"
                              [showErrors]="showErrors">
      <p-multiSelect [inputId]="id"
                      [id]="id"
                      [(ngModel)]="selectedValues"
                      (ngModelChange)="valueChanged()"
                      [loading]="loading"
                      [attr.placeholder]="placeholder | translate"
                      fluid
                      [options]="options"
                      [optionLabel]="optionLabel"
                      [optionValue]="optionValue"/>
    </app-form-field>
  `
})
export class SelectComponent<T> extends FormArrayDirective<T> implements OnInit {

  @Input() options: T[] = [];
  @Input() optionLabel?: string;
  @Input() optionValue?: string;

  @Input({required: true}) id: string;

  @Input() label?: string;
  @Input() helpText?: string;
  @Input() tooltip?: string;
  @Input() floatLabel: 'over' | 'on' | 'in' | null = 'on';
  @Input() inftaLabel: boolean = false;
  @Input() showChanges: boolean = true;
  @Input() showErrors: boolean = true;

  @Input() loading$?: Observable<boolean>;

  @Input() placeholder?: string;

  loading = false;

  constructor(private destroyRef: DestroyRef) {
    super();
  }

  override ngOnInit() {
    super.ngOnInit();
    if (this.loading$) {
      this.loading$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(loading => this.loading = loading);
    }
  }
}
