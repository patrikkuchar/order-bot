import {Component, effect} from '@angular/core';
import {TemplateDetail, TemplateManagerApi} from '../../../api';
import {ProjectService} from '../project.service';
import {withLoading} from '../../../shared/loading-pipe';
import {BehaviorSubject, Observable} from 'rxjs';
import {LoadingService} from '../../../core/services/loading.service';
import {LoadingDirective} from '../../../shared/directives/loading.directive';
import {SimpleSkeletonComponent} from '../../../shared/components/skeletons/simple-skeleton.component';

@Component({
  imports: [
    LoadingDirective
  ],
  template: `
    <div [appLoading]="loading" [skeleton]="SimpleSkeletonComponent">
      @if (project) {
        <h1>{{ project.name }}</h1>
        @if (project.description) {
          <p>{{ project.description }}</p>
        }
      }
    </div>
  `
})
export class OverviewComponent {

  project: TemplateDetail;
  loading: Observable<boolean>;

  constructor(api: TemplateManagerApi,
              svc: ProjectService,
              loadingSvc: LoadingService) {
    const loading$ = new BehaviorSubject(false);
    this.loading = loading$.asObservable();
    effect(() => {
      if (!svc.selectedProject()) {
        return;
      }
      api.getTemplateById(svc.selectedProject()!.id)
        .pipe(withLoading(loading$, loadingSvc))
        .subscribe(p => this.project = p);
    });
  }

  protected readonly SimpleSkeletonComponent = SimpleSkeletonComponent;
}
