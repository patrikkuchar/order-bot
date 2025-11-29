import {Component, effect} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {BaseRouteDirective} from '../../shared/directives/base-route.directive';
import {ProjectService} from './project.service';

@Component({
  imports: [
    RouterOutlet
  ],
  template: '<router-outlet></router-outlet>'
})
export class ProjectComponent extends BaseRouteDirective {

  private readonly projectIdParam = this.param<string>('projectId');

  constructor(svc: ProjectService) {
    super();
    effect(() => {
      const projectId = this.projectIdParam();
      console.log('projectId', projectId);
      if (projectId) {
        svc.selectProject(projectId);
        return;
      }
      const projects = svc.projects();
      const firstProject = projects[0];
      console.log('firstProject', firstProject);
      if (firstProject) {
        console.log('firstProject', firstProject);
        svc.selectProject(firstProject.code);
      }
    });
  }
}
