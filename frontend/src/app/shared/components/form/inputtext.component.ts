import {Component, Input} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {FormFieldComponent} from './wrapper/form-field/form-field.component';
import {InputText} from 'primeng/inputtext';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseFormInput} from './BaseFormInput';

@Component({
  selector: 'form-inputtext',
  imports: [
    FormFieldComponent,
    InputText,
    ReactiveFormsModule,
    TranslatePipe
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
        <input pInputText [id]="id"
               [type]="type"
               [formControl]="control"
               [attr.placeholder]="placeholder | translate"
               fluid/>
    </app-form-field>
  `
})
export class InputTextComponent extends BaseFormInput<string> {

  @Input() type: 'text' | 'email' | 'url' | 'tel' = 'text';
}
