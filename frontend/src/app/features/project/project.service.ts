import {computed, Injectable, Signal, signal} from '@angular/core';
import {TemplateManagerApi} from '../../api';
import {TransformUtils} from '../../shared/utils/transform.utils';

export type ProjectShortInfo = {
  name: string;
  code: string;
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private readonly _selectedProject = signal<ProjectShortInfo | null>(null);
  private readonly _projects = signal<ProjectShortInfo[]>([]);

  selectedProject: Signal<ProjectShortInfo | null> = this._selectedProject.asReadonly();

  projects = this._projects.asReadonly();

  constructor(private api: TemplateManagerApi) {
    this.reloadProjects();
  }

  reloadProjects(): void {
    this.api.listTemplates()
      .subscribe(templates => {
        this._projects.set(templates.map(t => ({
          id: t.id,
          name: t.name,
          code: TransformUtils.toSlug(t.name)
        })));
      });
  }

  selectProject(code: string): void {
    const project = this._projects().find(p => p.code === code) || null;
    this._selectedProject.set(project);
  }

  clearSelectedProject(): void {
    this._selectedProject.set(null);
  }
}
