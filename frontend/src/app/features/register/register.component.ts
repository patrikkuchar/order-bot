import {Component} from '@angular/core';
import {OPENAPI_SCHEMA} from '../../../assets/config/openapi.schema';
import {AuthApi, RegisterReq} from '../../api';
import {Card} from 'primeng/card';
import {Button} from 'primeng/button';
import {TranslatePipe} from '@ngx-translate/core';
import {FormComponent} from '../../shared/components/form/wrapper/form/form.component';
import {Observable} from 'rxjs';
import {InputTextComponent} from '../../shared/components/form/inputtext.component';
import {PasswordComponent} from '../../shared/components/form/password.component';
import {FormFieldComponent} from '../../shared/components/form/wrapper/form-field/form-field.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {InputGroupAddon} from 'primeng/inputgroupaddon';
import {AppRoutes} from '../../app.routes';
import {RoutePath} from '../../app/routes/types';
import {buildForm} from '../../shared/form/openapi/openapi-form-builder';
import {createAsyncValidator} from '../../shared/form/form.service';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-register',
  imports: [
    Card,
    Button,
    TranslatePipe,
    FormComponent,
    InputTextComponent,
    PasswordComponent,
    FormFieldComponent,
    FormsModule,
    InputText,
    ReactiveFormsModule,
    InputGroupAddon
  ],
  templateUrl: './register.component.html'
})
export class RegisterComponent {

  form = buildForm<RegisterReq>(
    OPENAPI_SCHEMA.RegisterReq,
    {
      email: {
        asyncValidators: [
          createAsyncValidator<string>(
            (email) =>
              this.api.isEmailUnique({ email }).pipe(
                // Return true if email is unique
                map(res => res.isUnique)
              ),
            'emailUsed'
          )
        ]
      }
    }
  );
  readonly register: (formData: RegisterReq) => Observable<any>;
  readonly redirect = () => AppRoutes.login as RoutePath;

  emailUsed: boolean | undefined = undefined;

  constructor(private api: AuthApi) {
    this.register = (data) => api.register(data);

    //const checkEmailUnique = (email: string) => {
    //  api.isEmailUnique({email}).subscribe(res => {
    //    this.emailUsed = !res.isUnique;
    //    if (!res.isUnique) {
    //      this.form.controls.email.setErrors({emailUsed: true}, {emitEvent: true});
    //    }
    //  });
    //}
//
    //this.form.controls.email.registerFnOnValueChange(checkEmailUnique);
  }
}
