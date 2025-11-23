// typescript
import {Component} from '@angular/core';
import {Card} from 'primeng/card';
import {Button} from 'primeng/button';
import {FormComponent} from '../../../shared/components/form/wrapper/form/form.component';
import {InputTextComponent} from '../../../shared/components/form/inputtext.component';
import {TranslateModule} from '@ngx-translate/core';
import {buildForm} from '../../../shared/form/openapi/openapi-form-builder';
import {TemplateCreateReq, TemplateManagerApi} from '../../../api';
import {OPENAPI_SCHEMA} from '../../../../assets/config/openapi.schema';
import {Observable, Observer} from 'rxjs';
import {ProjectRoutes} from '../project.routes';
import {RouteArgs, RoutePath} from '../../../app/routes/types';
import {TransformUtils} from '../../../shared/utils/transform.utils';
import {InputTextareaComponent} from '../../../shared/components/form/inputtextarea.component';
import {
  FormObjectArrayComponent
} from '../../../shared/components/form/wrapper/form-object-array/form-object-array.component';
import {InputNumberComponent} from '../../../shared/components/form/inputnumber.component';
import {ApiHandlingService} from '../../../core/services/api-handling.service';
import {ProjectService} from '../project.service';

@Component({
  imports: [
    Card,
    Button,
    FormComponent,
    InputTextComponent,
    InputTextareaComponent,
    FormObjectArrayComponent,
    InputNumberComponent,
    TranslateModule
  ],
  template: `
    <div class="flex flex-row min-w-full place-content-center">
      <p-card header="Create a new Template" class="w-fit">
        <app-form [form]="form" [onSubmit]="create" [submitHandler]="handler">
          <form-inputtext id="name"
                          label="Name"
                          [control]="form.controls.name"/>
          <form-inputtextarea id="description"
                              label="Description"
                              [control]="form.controls.description" />
          <app-form-object-array [array]="form.controls.steps">
            <ng-template #itemTemplate let-group let-index="index">
              <form-inputtextarea id="question-{{index}}"
                                  label="Step Question"
                                  [control]="group.controls.question" />
              <form-inputnumber id="stepNumber-{{index}}"
                                label="Step Number"
                                [control]="group.controls.stepNumber" />
              <form-inputnumber id="nextStepNumber-{{index}}"
                                label="Next Step Number"
                                [control]="group.controls.nextStepNumber" />
            </ng-template>
          </app-form-object-array>
          <p-button label="Create" severity="primary" type="submit"></p-button>
        </app-form>
      </p-card>
    </div>
  `
})
export class NewProjectComponent {

  form = buildForm<TemplateCreateReq>(OPENAPI_SCHEMA.TemplateCreateReq);
  readonly create: (formData: TemplateCreateReq) => Observable<void> | Promise<void>;
  readonly handler: Observer<void>;

  constructor(api: TemplateManagerApi,
              handlingSvc: ApiHandlingService,
              projectSvc: ProjectService) {
    this.create = (data) => api.createTemplate(data);

    const redirect: () => RouteArgs<RoutePath> | RoutePath = () => {
      const projectName = this.form.controls.name.getValue();
      const route = ProjectRoutes.of(TransformUtils.toSlug(projectName));
      return route.overview;
    }

    this.handler = handlingSvc.handle({
      onSuccess: () => projectSvc.reloadProjects(),
      redirect,
      successMsg: 'Project created successfully'
    })
  }
}
