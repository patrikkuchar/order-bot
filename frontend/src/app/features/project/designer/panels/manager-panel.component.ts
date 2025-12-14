import {Component, computed, effect, Signal, signal} from '@angular/core';
import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
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
  templateUrl: './manager-panel.component.html',
  styles: [`
    :host {
      display: block;
      height: 100%;
      min-height: 0;
    }

    :host ::ng-deep .manager-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
    }

    :host ::ng-deep .manager-card .p-card-body {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-height: 0;
      overflow: hidden;
    }

    :host ::ng-deep .manager-card .p-card-content {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-height: 0;
    }

    :host ::ng-deep .manager-form-scroll {
      flex: 1 1 auto;
      min-height: 0;
      max-height: 100%;
      overflow-y: auto;
    }
  `]
})
export class ManagerPanelComponent {

  form = buildForm<WipStepUpdateReq>(
    OPENAPI_SCHEMA.WipStepUpdateReq,
    {
      data: {
        validators: [this.selectDataMustHaveUniqueData()]
      }
    }
  );
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
        this.updateConnections();
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

  private updateConnections(): void {
    const oldConns = this.graphSvc.getOldConnectionsAndClear();
    oldConns.forEach(conn => this.api.deleteConnection(this.svc.sessionId()!, conn).subscribe());
  }

  private selectDataMustHaveUniqueData(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const type = control.get('type')!.value as TemplateStepType;
      if (type !== TemplateStepType.SELECT) return null;

      const options = control.get('selectTypeData')?.value as { options?: WipStepTypeSelectOption[] } | null;
      if (!options?.options) return null;

      const optionKeys = options.options.map(o => o.value);

      const alreadySeen = new Set<string>();

      for (const key of optionKeys) {
        if (!key) return { selectOptionsMustHaveUniqueData: true };
        if (alreadySeen.has(key)) return { selectOptionsMustHaveUniqueData: true };
        alreadySeen.add(key);
      }

      return null;
    };
  }

  protected readonly TemplateStepPosition = TemplateStepPosition;
}
