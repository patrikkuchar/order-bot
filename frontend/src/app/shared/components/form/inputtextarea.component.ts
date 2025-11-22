import {Component, Input} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {FormFieldComponent} from './wrapper/form-field/form-field.component';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseFormInput} from './BaseFormInput';
import {Textarea} from 'primeng/textarea';

@Component({
  selector: 'form-inputtextarea',
  imports: [
    FormFieldComponent,
    Textarea,
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
        <textarea pInputTextarea [id]="id"
                  [formControl]="control"
                  [attr.placeholder]="placeholder | translate"
                  fluid></textarea>
    </app-form-field>
  `
})
export class InputTextareaComponent extends BaseFormInput<string> {
  // You can add more @Input()s if needed, e.g. rows, cols, etc.
}

