import {Directive, Input} from '@angular/core';
import {CustomFormControl} from '../../form/custom/custom-form-controls';
import {Observable} from 'rxjs';

@Directive()
export abstract class BaseFormInput<T> {
  @Input({required: true}) id: string;
  @Input({required: true}) control: CustomFormControl<T | null>;

  @Input() label?: string;
  @Input() helpText?: string;
  @Input() tooltip?: string;
  @Input() floatLabel: 'over' | 'on' | 'in' | null = 'on';
  @Input() inftaLabel: boolean = false;
  @Input() showChanges: boolean = true;
  @Input() showErrors: boolean = true;

  @Input() loading$?: Observable<boolean>;

  @Input() placeholder?: string;
}
