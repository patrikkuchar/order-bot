import {Component} from '@angular/core';
import {BaseRouteDirective} from '../../shared/directives/base-route.directive';
import {Button} from 'primeng/button';
import {RedirectDirective} from '../../shared/directives/redirect.directive';
import {AppRoutes} from '../../app.routes';
import {BehaviorSubject, Observable, timer} from 'rxjs';
import {withLoading} from '../../shared/loading-pipe';
import {LoadingDirective} from '../../shared/directives/loading.directive';
import {SimpleSkeletonComponent} from '../../shared/components/skeletons/simple-skeleton.component';
import {LoadingService} from '../../core/services/loading.service';

@Component({
  imports: [
    Button,
    RedirectDirective,
    LoadingDirective
  ],
  template: `
    @if (id$()) {
      <div>Detail componentu s id {{ id$() }}</div>
    }
    <p-button [appRedirect]="AppRoutes.test.root" label="Go to LP" [appLoading]="loading$" [buttonLoading]="true"></p-button>
    <div [appLoading]="loading$" [skeleton]="SimpleSkeletonComponent"><p>Content should be display when <br> timer ended <br> (data loaded)</p></div>
  `
})
export class TestDetailComponent extends BaseRouteDirective {

  readonly id$ = this.param<number>('id');
  loading$: Observable<boolean>;

  constructor(loadingSvc: LoadingService) {
    super();
    const loading = new BehaviorSubject<boolean>(false);
    this.loading$ = loading.asObservable();
    const id = loadingSvc.show();
    timer(3000)
      .pipe(withLoading(loading, loadingSvc))
      .subscribe(() => {
        console.log('Data loaded');
        loadingSvc.hide(id);
      });
  }

  protected readonly AppRoutes = AppRoutes;
  protected readonly SimpleSkeletonComponent = SimpleSkeletonComponent;
}
