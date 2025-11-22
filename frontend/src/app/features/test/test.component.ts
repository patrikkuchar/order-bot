import { Component } from '@angular/core';
import {TestApi, TestEntityDto, TestEntityDtoCategoryEnum} from '../../api';
import {OPENAPI_SCHEMA} from '../../../assets/config/openapi.schema';
import {BehaviorSubject, filter, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {FormComponent} from '../../shared/components/form/wrapper/form/form.component';
import {Button} from 'primeng/button';
import {TransformUtils} from '../../shared/utils/transform.utils';
import {InputNumberComponent} from '../../shared/components/form/inputnumber.component';
import {InputTextComponent} from '../../shared/components/form/inputtext.component';
import {SelectComponent} from '../../shared/components/form/select.component';
import {InputTextareaComponent} from '../../shared/components/form/inputtextarea.component';
import {CheckboxComponent} from '../../shared/components/form/checkbox/checkbox.component';
import {
  FormObjectArrayComponent
} from '../../shared/components/form/wrapper/form-object-array/form-object-array.component';
import {buildForm} from '../../shared/form/openapi/openapi-form-builder';

@Component({
  selector: 'app-test',
  imports: [
    FormComponent,
    Button,
    InputNumberComponent,
    InputTextComponent,
    SelectComponent,
    InputTextareaComponent,
    CheckboxComponent,
    FormObjectArrayComponent
  ],
  templateUrl: './test.component.html'
})
export class TestComponent {

  readonly form = buildForm<TestEntityDto>(OPENAPI_SCHEMA.TestEntityDto, undefined, undefined, true);
  readonly update: (data: TestEntityDto) => Observable<void>;
  readonly fetch: () => Observable<TestEntityDto>;

  readonly options = TransformUtils.getEnumValuesAsEnum(TestEntityDtoCategoryEnum);

  loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  constructor(api: TestApi) {
    this.update = (data) => api.updateEntity(data);
    this.fetch = () => api.getEntity().pipe(
      map(res => res.entity),
      filter(en => !!en)
    );
  }
}
