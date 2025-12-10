import {Component, DestroyRef, Input, OnInit} from '@angular/core';
import {CustomFormControl} from '../../form/custom/custom-form-controls';
import {MyTranslateService} from '../../../core/services/my-translate.service';
import {getTranslatedValuesForSelect, TranslatedValue} from './form-control.utils';
import {RadioButton} from 'primeng/radiobutton';
import {FormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {filter} from 'rxjs';

@Component({
  selector: 'form-radiobutton',
  imports: [
    RadioButton,
    FormsModule,
    TranslatePipe
  ],
  template: `
    @if (label) {
      <label [for]="id" class="block mb-2 font-medium">{{label | translate}}</label>
    }
    <div class="flex gap-4"
         [class.flex-col]="layout === 'vertical'"
         [class.flex-row]="layout === 'horizontal'"
    >
      @for (option of formOptions; track option.value; let i = $index) {
        <div class="flex items-center">
          <p-radio-button
            [name]="id"
            [value]="option.value"
            [(ngModel)]="selectedValue"
            (ngModelChange)="valueChanged()"
            [inputId]="id + '-' + i"
            [invalid]="invalid"/>
          <label [for]="id + '-' + i" class="ml-2">{{option.label | translate}}</label>
        </div>
      }
    </div>
  `
})
export class RadioButtonComponent<T> implements OnInit {

  @Input({required: true}) id: string;
  @Input({required: true}) control: CustomFormControl<T | null>;
  @Input({required: true}) options: T[];

  formOptions: TranslatedValue<T>[];

  @Input() i18nPrefix?: string;

  @Input() label?: string;

  @Input() layout: 'horizontal' | 'vertical' = 'vertical';

  invalid = false;

  selectedValue: T | null;

  constructor(private destroyRef: DestroyRef,
              private translationSvc: MyTranslateService) {
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
    this.control.setValue(this.selectedValue, { emitEvent: true });
  }

  private computeOptions() {
    if (this.i18nPrefix) {
      this.formOptions = getTranslatedValuesForSelect(this.translationSvc, this.options, this.i18nPrefix);
    } else {
      this.formOptions = this.options.map(option => ({label: option as unknown as string, value: option}));
    }
  }
}
