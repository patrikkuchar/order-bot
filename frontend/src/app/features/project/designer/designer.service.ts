import {Injectable, Signal} from '@angular/core';
import {ProjectService} from '../project.service';
import {WipTemplateMngApi} from '../../../api';
import {map, of, switchMap} from 'rxjs';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class DesignerService {

  sessionId: Signal<string | null>;

  constructor(projectSvc: ProjectService,
              api: WipTemplateMngApi) {
    this.sessionId = toSignal(
      toObservable(projectSvc.selectedProject).pipe(
        switchMap(project => project ? api.getSession(project.id) : of(null)),
        map(res => res?.value ?? null)
      ),
      { initialValue: null }
    );
  }
}
