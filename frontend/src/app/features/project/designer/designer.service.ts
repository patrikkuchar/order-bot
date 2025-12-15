import {effect, Injectable, signal, Signal} from '@angular/core';
import {ProjectService} from '../project.service';
import {WipTemplateMngApi} from '../../../api';
import {map, of, switchMap} from 'rxjs';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class DesignerService {

  private _sessionId = signal<string | null>(null);
  sessionId = this._sessionId.asReadonly();

  private readonly loadSession: (projectId?: string) => void;

  constructor(private projectSvc: ProjectService,
              api: WipTemplateMngApi) {
    this.loadSession = (projectId?: string) => {
      if (!projectId) {
        this._sessionId.set(null);
        return;
      }
      api.getSession(projectId)
        .subscribe(res => this._sessionId.set(res.value));
    }

    effect(() => this.loadSession(projectSvc.selectedProject()?.id));
  }

  reloadSession() {
    this.loadSession(this.projectSvc.selectedProject()?.id);
  }
}
