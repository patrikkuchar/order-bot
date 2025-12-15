import {effect, Injectable, signal, Signal} from '@angular/core';
import {ProjectService} from '../project.service';
import {WipStepDetailRes, WipStepListRes, WipTemplateMngApi} from '../../../api';
import {Observable, ReplaySubject} from 'rxjs';
import {DesignerGraphService} from './designer-graph.service';

const EMPTY_STEPS: WipStepListRes = {steps: [], connections: []};

@Injectable({
  providedIn: 'root'
})
export class DesignerService {

  private _sessionId = signal<string | null>(null);
  sessionId = this._sessionId.asReadonly();

  private _steps = new ReplaySubject<WipStepListRes>(1);
  private _syncSteps: WipStepListRes = EMPTY_STEPS;
  steps$: Observable<WipStepListRes> = this._steps.asObservable();

  private _step = new ReplaySubject<WipStepDetailRes>(1);
  step$ = this._step.asObservable();

  private readonly loadSession: (projectId?: string) => void;

  constructor(private projectSvc: ProjectService,
              api: WipTemplateMngApi,
              graphSvc: DesignerGraphService) {
    this.loadSession = (projectId?: string) => {
      if (!projectId) {
        this._sessionId.set(null);
        return;
      }
      api.getSession(projectId)
        .subscribe(res => this._sessionId.set(res.value));
    }

    effect(() => this.loadSession(projectSvc.selectedProject()?.id));
    effect(() => {
      if (this.sessionId()) {
        api.getSteps(this.sessionId()!)
          .subscribe(steps => {
            this._syncSteps = steps;
            this._steps.next(steps);
          });
      } else {
        this._steps.next(EMPTY_STEPS);
      }
    });
    effect(() => {
      if (graphSvc.selectedNodeId() && this.sessionId() && projectSvc.projectCode()) {
        api.getStep(this.sessionId()!, graphSvc.selectedNodeId()!)
          .subscribe(step => this._step.next(step));
      }
    });
  }

  stepName(stepId: string): string | null {
    const step = this._syncSteps.steps.find(s => s.stepNumber === stepId);
    return step ? step.nodeData.title : null;
  }

  reloadSession() {
    this.loadSession(this.projectSvc.selectedProject()?.id);
  }
}
