import {Component, computed, Signal} from '@angular/core';
import {Card} from 'primeng/card';
import {NgClass, NgIf, NgFor} from '@angular/common';
import {DesignerService} from '../designer.service';
import {BoxNodeDefinition} from '../../../../shared/components/box-visualizer/box-visualizer.component';
import {DesignerGraphService} from '../designer-graph.service';
import {
  TemplateStepPosition, TemplateStepType,
  WipStepDetailRes,
  WipStepNodeData,
  WipStepUpdateReq,
  WipTemplateMngApi
} from '../../../../api';
import {InputTextComponent} from '../../../../shared/components/form/inputtext.component';
import {buildForm} from '../../../../shared/form/openapi/openapi-form-builder';
import {OPENAPI_SCHEMA} from '../../../../../assets/config/openapi.schema';
import {InputTextareaComponent} from '../../../../shared/components/form/inputtextarea.component';
import {FormComponent} from '../../../../shared/components/form/wrapper/form/form.component';
import {map, Observable, Observer, tap} from 'rxjs';
import {ApiHandlingService} from '../../../../core/services/api-handling.service';
import {SelectComponent} from '../../../../shared/components/form/select.component';
import {SelectButtonComponent} from '../../../../shared/components/form/selectbutton.component';
import {RadioButtonComponent} from '../../../../shared/components/form/radiobutton.component';
import {TransformUtils} from '../../../../shared/utils/transform.utils';

@Component({
  selector: 'app-manager-panel',
  imports: [
    Card,
    NgClass,
    InputTextComponent,
    InputTextareaComponent,
    FormComponent,
    SelectButtonComponent,
    RadioButtonComponent,
  ],
  template: `
    <div class="h-full">
      <p-card title="Manager" ngClass="h-full min-h-full">
        @if (selectedNode() && formContext(); as ctx) {
          <div class="flex flex-col gap-3">
            <div>
              @if (selectedStep) {
                <h2 class="text-xs text-color-secondary">{{ selectedStep.stepNumber }}</h2>
              }
              <app-form [form]="form"
                        [onSubmit]="ctx.saveStep"
                        submitStrategy="onFormChange"
                        [dataFetcher]="ctx.fetcher"
                        [submitHandler]="ctx.handler"
                        [resetOnSubmit]="false">
                <div class="flex flex-row gap-8">
                  <div class="grow flex flex-col gap-4 h-full">
                    <form-inputtext id="title"
                                    label="Title"
                                    [control]="form.controls.title" />
                    <form-inputtextarea id="question"
                                        label="Question"
                                        [control]="form.controls.question" />
                  </div>
                  <div class="flex flex-col gap-4 h-full">
                    <form-selectbutton id="orderPosition"
                                       [control]="form.controls.orderPosition"
                                       [options]="orderPositionOptions"
                                       [emptyOption]="TemplateStepPosition.MIDDLE"
                                       i18nPrefix="designer.managerPanel.orderPosition" />
                    <form-radiobutton id="type"
                                      label="Type"
                                      [control]="form.controls.data.controls.type"
                                      [options]="typeOptions"
                                      i18nPrefix="designer.managerPanel.type" />
                  </div>
                </div>
              </app-form>
            </div>
          </div>
        } @else {
          <p class="text-color-secondary">Select a node in the designer to see its details here.</p>
        }
      </p-card>
    </div>
  `
})
export class ManagerPanelComponent {

  form = buildForm<WipStepUpdateReq>(OPENAPI_SCHEMA.WipStepUpdateReq);
  handler?: Observer<WipStepNodeData>;
  fetcher?: () => Observable<WipStepUpdateReq>;

  selectedStep: WipStepDetailRes | null = null;
  selectedNode: Signal<BoxNodeDefinition | null>;

  saveStep?: (data: WipStepUpdateReq) => Observable<WipStepNodeData>;
  readonly orderPositionOptions = [
    TemplateStepPosition.FIRST,
    TemplateStepPosition.LAST
  ];
  readonly typeOptions = TransformUtils.getEnumValuesAsEnum(TemplateStepType);

  readonly formContext = computed(() => {
    const nodeId = this.graphSvc.selectedNodeId();
    const sessionId = this.svc.sessionId();

    if (!nodeId || !sessionId) {
      this.selectedStep = null;
      this.fetcher = undefined;
      this.saveStep = undefined;
      this.handler = undefined;
      return null;
    }

    const fetcher = () => this.api.getStep(sessionId, nodeId).pipe(
      tap(data => this.selectedStep = data),
      map(d => ({
        title: d.title,
        question: d.question,
        orderPosition: d.orderPosition,
        data: d.data
      }) as WipStepUpdateReq)
    );

    const saveStep = (data: WipStepUpdateReq) => this.api.updateStep(sessionId, nodeId, data);

    const handler = this.apiHandler.handle({
      onSuccess: (data: WipStepNodeData) => {
        this.graphSvc.updateNode(nodeId, data);
      },
      silentSuccess: true
    });

    // Expose values for template binding
    this.fetcher = fetcher;
    this.saveStep = saveStep;
    this.handler = handler;

    return { fetcher, saveStep, handler };
  });

  constructor(private graphSvc: DesignerGraphService,
              private svc: DesignerService,
              private api: WipTemplateMngApi,
              private apiHandler: ApiHandlingService) {
    this.selectedNode = graphSvc.selectedNode;
  }

  protected readonly TemplateStepPosition = TemplateStepPosition;
}
