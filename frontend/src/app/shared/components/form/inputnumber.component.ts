import {Component, Input, OnInit, Signal} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {FormFieldComponent} from './wrapper/form-field/form-field.component';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseFormInput} from './BaseFormInput';
import {InputNumber} from 'primeng/inputnumber';
import {AppSettingsService} from '../../../core/services/app-settings.service';

@Component({
  selector: 'form-inputnumber',
  imports: [
    FormFieldComponent,
    ReactiveFormsModule,
    TranslatePipe,
    InputNumber
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
      <p-inputNumber [formControl]="control"
                    [id]="id"
                    [inputId]="id"
                    [mode]="isCurrency ? 'currency' : 'decimal'"
                    [currency]="currencyValue"
                    [locale]="locale()"
                    [placeholder]="placeholder | translate"
                    fluid
                    [useGrouping]="useGrouping"
                    [minFractionDigits]="minFractionDigits"
                    [maxFractionDigits]="maxFractionDigits"
                    [min]="$any(min)"
                    [max]="$any(max)"
                    [prefix]="prefix"
                    [suffix]="suffix"
      />
    </app-form-field>
  `
})
export class InputNumberComponent extends BaseFormInput<number> implements OnInit {

  @Input() useGrouping = false;
  @Input() minFractionDigits?: number;
  @Input() maxFractionDigits?: number;
  @Input() min?: number;
  @Input() max?: number;
  @Input() prefix?: string;
  @Input() suffix?: string;
  @Input() currency?: string;
  @Input() isCurrency: boolean = false;

  locale: Signal<string>;
  currencyValue: string | undefined;

  private _appCurrency: Signal<string>;

  constructor(appSettings: AppSettingsService) {
    super();
    this.locale = appSettings.locale;
    this._appCurrency = appSettings.currency;
  }

  ngOnInit() {
    if (this.isCurrency) {
      this.currencyValue = this.currency ?? this._appCurrency();
    }
  }
}
