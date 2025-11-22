import {Component, Input} from '@angular/core';
import {BaseFormInput} from './BaseFormInput';
import {FormFieldComponent} from './wrapper/form-field/form-field.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {Password} from 'primeng/password';

export interface PasswordOptions {
  prompt: string;
  weak: string;
  medium: string;
  strong: string;
  mediumRegex?: string;
  strongRegex?: string;
}

@Component({
  selector: 'form-password',
  imports: [
    FormFieldComponent,
    FormsModule,
    Password,
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
      <p-password [id] = id
                  [formControl]="control"
                  [placeholder]="placeholder | translate"
                  [toggleMask]="toggleMask"
                  [promptLabel]="passwordLabel.prompt | translate"
                  [weakLabel]="passwordLabel.weak | translate"
                  [mediumLabel]="passwordLabel.medium | translate"
                  [strongLabel]="passwordLabel.strong | translate"
                  [attr.mediumRegex]="passwordLabel.mediumRegex || null"
                  [attr.strongRegex]="passwordLabel.strongRegex || null"
                  fluid
                    />
    </app-form-field>
  `
})
export class PasswordComponent extends BaseFormInput<string> {

  @Input() toggleMask = true;

  @Input() passwordLabel: PasswordOptions = {
    prompt: 'password.choose',
    weak: 'password.weak',
    medium: 'password.medium',
    strong: 'password.strong'
  };
}
