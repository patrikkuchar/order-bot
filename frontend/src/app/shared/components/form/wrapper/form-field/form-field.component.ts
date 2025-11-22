import {
  Component,
  DestroyRef,
  Input,
  OnInit
} from '@angular/core';
import {FloatLabel} from 'primeng/floatlabel';
import {IftaLabel} from 'primeng/iftalabel';
import {TranslatePipe} from '@ngx-translate/core';
import {AsyncPipe, NgTemplateOutlet} from '@angular/common';
import {Tooltip} from 'primeng/tooltip';
import {InputGroup} from 'primeng/inputgroup';
import {ProgressSpinner} from 'primeng/progressspinner';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormUtils} from '../../../../utils/form.utils';
import {Message} from 'primeng/message';
import {InputGroupAddon} from 'primeng/inputgroupaddon';
import {CustomFormArray} from '../../../../form/custom/custom-form-array';
import {CustomFormControl} from '../../../../form/custom/custom-form-controls';
import {InputIcon} from 'primeng/inputicon';
import {IconField} from 'primeng/iconfield';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-form-field',
  imports: [
    FloatLabel,
    IftaLabel,
    TranslatePipe,
    NgTemplateOutlet,
    Tooltip,
    InputGroup,
    Message,
    InputIcon,
    IconField,
    AsyncPipe
  ],
  templateUrl: './form-field.component.html',
  styles: `
    :host ::ng-deep span[pTooltip] {
      display: contents;  /* Zachová layout ako bez wrappera */
      width: 100%;  /* Alebo flex: 1; ak je v flex */
    }

    :host ::ng-deep .is-edited {
      .p-component {
        border-color: var(--p-orange-500) !important;
      }
    }
  `
})
export class FormFieldComponent implements OnInit {

  @Input({required: true}) forId: string;
  @Input({required: true}) control: CustomFormControl | CustomFormArray<any>;
  @Input() label?: string;
  @Input() helpText?: string;
  @Input() tooltip?: string;

  @Input() floatLabel: 'over' | 'on' | 'in' | null = null;
  @Input() inftaLabel = false;

  @Input() showChanges = true;
  @Input() showErrors = true;

  @Input() loading$?: Observable<boolean>;

  errorMessage: string | null = null;
  errorParams: any = null;
  valueChanged = false;

  isRequired = false;

  constructor(private destroyRef: DestroyRef) {}

  ngOnInit() {
    this.isRequired = this.control.validator?.({} as any)?.["required"];
    if (this.showErrors || this.showChanges) {
        this.control.statusChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          if (this.showErrors) {
            const err = FormUtils.isInvalid(this.control) ? FormUtils.getErrorMessage(this.control) : undefined;
            this.errorMessage = err?.messageKey ?? null;
            this.errorParams = err?.errorParams ?? null;
          }
          if (this.showChanges)
            this.valueChanged = (this.control as CustomFormControl).isChanged;
        });
    }
    if (this.loading$) {
      this.loading$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(loading => {
          if (loading) {
            this.control.disable();
          } else {
            this.control.enable();
          }
        });
    }
  }
}
