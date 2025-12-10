import {Component, computed, effect, Signal, signal} from '@angular/core';
import {Card} from 'primeng/card';
import {NgClass} from '@angular/common';
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
import {SelectButtonComponent} from '../../../../shared/components/form/selectbutton.component';
import {RadioButtonComponent} from '../../../../shared/components/form/radiobutton.component';
import {TransformUtils} from '../../../../shared/utils/transform.utils';
import {FormObjectArrayComponent} from '../../../../shared/components/form/wrapper/form-object-array/form-object-array.component';
import {MyStorage} from '../../../../shared/persistance/MyStorage';
import {toSignal} from '@angular/core/rxjs-interop';
import {CustomFormArray} from '../../../../shared/form/custom/custom-form-array';
import {WipStepTypeSelectOption} from '../../../../api';
import {CustomFormGroup} from '../../../../shared/form/custom/custom-form-group';

type ManagerPanelSection = 'main' | 'options' | 'error-handlers';

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
    FormObjectArrayComponent,
  ],
  template: `
    <div class="h-full">
      <p-card title="Manager" ngClass="h-full min-h-full">
        @if (selectedNode() && formContext(); as ctx) {
          @if (selectedStep) {
            <h2 class="text-xs text-color-secondary mb-4">{{ selectedStep.stepNumber }}</h2>
          }
          <div class="flex h-full gap-6">
            <div class="flex flex-col gap-2 w-25 -ml-6 mr-2">
              @for (section of visibleSections(); track section.key) {
                <button type="button"
                        class="text-left px-3 py-2 rounded-r-md border shadow-sm transition-colors"
                        [ngClass]="{
                          'bg-primary-50 text-primary border-primary-200': activeSection() === section.key,
                          'bg-surface-0 text-color-secondary border-surface-200': activeSection() !== section.key
                        }"
                        (click)="selectSection(section.key)">
                  {{ section.label }}
                </button>
              }
            </div>
            <div class="flex flex-col gap-3 grow">
              <app-form [form]="form"
                        [onSubmit]="ctx.saveStep"
                        submitStrategy="onFormChange"
                        [dataFetcher]="ctx.fetcher"
                        [submitHandler]="ctx.handler"
                        [resetOnSubmit]="false">
                <div class="flex flex-col gap-6">
                  @switch (activeSection()) {
                    @case ('main') {
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
                    }
                    @case ('options') {
                      @if (selectOptionsArray; as optionsArray) {
                        <app-form-object-array [array]="optionsArray"
                                               layout="vertical"
                                               itemsLayout="horizontal"
                                               [layoutGap]="'1.5rem'"
                                               [itemsGap]="'0.75rem'">
                          <ng-template #itemTemplate let-group let-index="index" let-removeFn="removeFn">
                            <form-inputtext [id]="'option-label-' + index"
                                            class="w-full"
                                            label="Label"
                                            [control]="group.controls.label" />
                            <form-inputtext [id]="'option-value-' + index"
                                            class="w-full"
                                            label="Value"
                                            [control]="group.controls.value" />
                          </ng-template>
                        </app-form-object-array>
                      } @else {
                        <p class="text-color-secondary text-sm">Options are available only for Select steps.</p>
                      }
                    }
                    @case ('error-handlers') {
                      <p class="text-color-secondary text-sm">Error handlers configuration will appear here.</p>
                    }
                  }
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

  private readonly sectionStorage = new MyStorage<ManagerPanelSection>('designerManagerPanelSection', sessionStorage);
  private readonly typeSignal = toSignal(this.form.controls.data.controls.type.valueChanges, {
    initialValue: this.form.controls.data.controls.type.value
  });

  readonly selectedSection = signal<ManagerPanelSection>(this.sectionStorage.get() ?? 'main');
  readonly activeSection = computed<ManagerPanelSection>(() => {
    const desired = this.selectedSection();
    if (desired === 'options' && !this.isOptionsStep()) {
      return 'main';
    }
    return desired;
  });
  readonly visibleSections = computed(() => {
    const sections: { key: ManagerPanelSection; label: string }[] = [
      { key: 'main', label: 'Main' },
    ];
    if (this.isOptionsStep()) {
      sections.push({ key: 'options', label: 'Options' });
    }
    sections.push({ key: 'error-handlers', label: 'Error handlers' });
    return sections;
  });

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
    effect(() => this.sectionStorage.save(this.activeSection()));
  }

  selectSection(section: ManagerPanelSection): void {
    if (section === 'options' && !this.isOptionsStep()) {
      section = 'main';
    }
    this.selectedSection.set(section);
  }

  private isOptionsStep(): boolean {
    return this.typeSignal() === TemplateStepType.SELECT && !!this.selectOptionsArray;
  }

  get selectOptionsArray(): CustomFormArray<CustomFormGroup<WipStepTypeSelectOption>> | null {
    return this.form.controls.data.controls.selectTypeData?.controls.options ?? null;
  }

  protected readonly TemplateStepPosition = TemplateStepPosition;
}
