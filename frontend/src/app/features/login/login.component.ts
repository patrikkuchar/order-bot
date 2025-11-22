import { Component } from '@angular/core';
import {Button} from 'primeng/button';
import {Card} from 'primeng/card';
import {FormComponent} from '../../shared/components/form/wrapper/form/form.component';
import {InputTextComponent} from '../../shared/components/form/inputtext.component';
import {PasswordComponent} from '../../shared/components/form/password.component';
import {TranslatePipe} from '@ngx-translate/core';
import {LoginReq} from '../../api';
import {OPENAPI_SCHEMA} from '../../../assets/config/openapi.schema';
import {Observable, tap} from 'rxjs';
import {AuthService} from '../../core/services/auth.service';
import {AppRoutes} from '../../app.routes';
import {RedirectService} from '../../core/services/redirect.service';
import {buildForm} from '../../shared/form/openapi/openapi-form-builder';

@Component({
  selector: 'app-login',
  imports: [
    Button,
    Card,
    FormComponent,
    InputTextComponent,
    PasswordComponent,
    TranslatePipe
  ],
  templateUrl: './login.component.html'
})
export class LoginComponent {

  form = buildForm<LoginReq>(OPENAPI_SCHEMA.LoginReq);
  readonly login: (formData: LoginReq) => Observable<void>
  readonly redirect = () => AppRoutes.home;

  constructor(svc: AuthService,
              redirectSvc: RedirectService) {
    this.login = (data) => svc.login(data)
      .pipe(tap(() => redirectSvc.withStored(AppRoutes.home)));
  }
}
