import {Component} from '@angular/core';
import {ListViewComponent} from '../../shared/components/list-view/list-view.component';
import {PageReq, TestApi, TestItemDto, TestItemListFilter} from '../../api';
import {RouteArgs, RoutePath} from '../../app/routes/types';
import {AppRoutes} from '../../app.routes';
import {createFetcher, FetcherWrapper} from '../../shared/api/fetcher-wrapper';
import {Observable, Subject} from 'rxjs';
import {ListViewOrchestrator} from '../../shared/components/list-view/list-view.orchestrator';
import {LayoutViewComponent} from '../../shared/components/list-view/views/layout-view.component';

@Component({
  imports: [
    LayoutViewComponent
  ],
  template: `
    <app-layout-view [orc]="orc" [detailRedirect]="detail" [gridLayout]="{
      definedNumberOf: 'cols',
      flow: 'row',
      numberOf: 3,
      gapX: 4,
      gapY: 4
    }">
      <ng-template #itemTemplate let-data="data" let-redirectToDetail="redirectToDetail">
        <div class="p-4 border rounded-lg hover:shadow-lg cursor-pointer" (click)="redirectToDetail(data)">
          <div class="font-bold text-lg">Title: {{ data.title }}</div>
          <div>Category: {{ data.category }}</div>
          <div>Price: {{ data.price }}</div>
        </div>
      </ng-template>
    </app-layout-view>
  `
})
export class TestGridComponent {

  detail: (item: TestItemDto) => RouteArgs<RoutePath>;

  refresh$: Observable<void>;

  orc: ListViewOrchestrator<TestItemDto, TestItemListFilter>;

  constructor(api: TestApi) {
    this.orc = new ListViewOrchestrator<TestItemDto, TestItemListFilter>({
      fetcher: createFetcher<TestItemDto, TestItemListFilter>(
        (filter: TestItemListFilter, req: PageReq) => api.listEntitiesWithPaging(filter, req),
        'paginatedFiltered'
      ),
      nextPageConf: {
        mode: 'scroll',
        firstPageSize: 15,
        nextPagesSize: 2
      }
    });

    this.detail = (item) => {
      return {
        pathFn: AppRoutes.test.detail,
        args: [item.category.length]
      }
    };

    const refresh = new Subject<void>();
    this.refresh$ = refresh.asObservable();
    setInterval(() => refresh.next(), 5000);
  }

}
