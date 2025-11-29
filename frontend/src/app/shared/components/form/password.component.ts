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

export const DEFAULT_PASSWORD_WEAKNESS_OVERLAY: PasswordOptions = {
  prompt: 'password.choose',
  weak: 'password.weak',
  medium: 'password.medium',
  strong: 'password.strong'
}

//TODO: TEMPLATE update password field
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
      @if (passwordWeaknessOverlay) {
        <p-password [id] = id
                    [formControl]="control"
                    [placeholder]="placeholder | translate"
                    [toggleMask]="toggleMask"
                    [promptLabel]="passwordWeaknessOverlay.prompt | translate"
                    [weakLabel]="passwordWeaknessOverlay.weak | translate"
                    [mediumLabel]="passwordWeaknessOverlay.medium | translate"
                    [strongLabel]="passwordWeaknessOverlay.strong | translate"
                    [attr.mediumRegex]="passwordWeaknessOverlay.mediumRegex || null"
                    [attr.strongRegex]="passwordWeaknessOverlay.strongRegex || null"
                    fluid
        />
      } @else {
        <p-password [id] = id
                    [formControl]="control"
                    [placeholder]="placeholder | translate"
                    [toggleMask]="toggleMask"
                    [feedback]="false"
                    fluid
        />
      }
    </app-form-field>
  `
})
export class PasswordComponent extends BaseFormInput<string> {

  @Input() toggleMask = true;

  @Input() passwordWeaknessOverlay?: PasswordOptions;
}
