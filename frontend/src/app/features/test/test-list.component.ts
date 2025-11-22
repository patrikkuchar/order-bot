import {Component} from '@angular/core';
import {PageReq, TestApi, TestItemDto, TestItemListFilter} from '../../api';
import {RouteArgs, RoutePath} from '../../app/routes/types';
import {AppRoutes} from '../../app.routes';
import {createFetcher} from '../../shared/api/fetcher-wrapper';
import {Observable, Subject} from 'rxjs';
import {ListViewOrchestrator} from '../../shared/components/list-view/list-view.orchestrator';
import {LayoutViewComponent} from '../../shared/components/list-view/views/layout-view.component';
import {TestFilterComponent} from './test-filter.components';
import {OPENAPI_SCHEMA} from '../../../assets/config/openapi.schema';
import {buildForm} from '../../shared/form/openapi/openapi-form-builder';

@Component({
  imports: [
    LayoutViewComponent,
    TestFilterComponent
  ],
  template: `
    <app-layout-view [orc]="orc" [detailRedirect]="detail" [flexLayout]="{
      direction: 'row',
      wrap: 'wrap',
      gapX: 4,
      gapY: 5
    }">
      <ng-template #itemTemplate let-data="data" let-redirectToDetail="redirectToDetail">
        <div class="p-4 border rounded-lg hover:shadow-lg cursor-pointer" (click)="redirectToDetail(data)">
          <div class="font-bold text-lg">Title: {{ data.title }}</div>
          <div>Category: {{ data.category }}</div>
          <div>Price: {{ data.price }}</div>
        </div>
      </ng-template>
      <ng-template #filterTemplate let-form="form" let-submitFn="submitFn" let-clearFilter="clearFilter">
        <app-test-filter [form]="form" [submitFn]="submitFn" [clearFilter]="clearFilter"/>
      </ng-template>
    </app-layout-view>
  `
})
export class TestListComponent {

  detail: (item: TestItemDto) => RouteArgs<RoutePath>;

  refresh$: Observable<void>;

  orc: ListViewOrchestrator<TestItemDto, TestItemListFilter>;

  constructor(api: TestApi) {
    this.orc = new ListViewOrchestrator<TestItemDto, TestItemListFilter>({
      fetcher: createFetcher<TestItemDto, TestItemListFilter>(
        (filter: TestItemListFilter, req: PageReq) => api.listEntitiesWithPaging(filter, req),
        'paginatedFiltered'
      ),
      numberPageConf: {
        pageSize: 12,
        pageSizes: [12, 24, 48]
      },
      filterConf: {
        form: buildForm<TestItemListFilter>(OPENAPI_SCHEMA.TestItemListFilter),
        emitOnChange: true,
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
