import {Component} from '@angular/core';
import {PageReq, TestApi, TestItemDto, TestItemListFilter} from '../../api';
import {RouteArgs, RoutePath} from '../../app/routes/types';
import {AppRoutes} from '../../app.routes';
import {createFetcher} from '../../shared/api/fetcher-wrapper';
import {Observable, Subject} from 'rxjs';
import {ListViewOrchestrator} from '../../shared/components/list-view/list-view.orchestrator';
import {TableViewComponent} from '../../shared/components/list-view/views/table-view.component';
import {TestFilterComponent} from './test-filter.components';
import {OPENAPI_SCHEMA} from '../../../assets/config/openapi.schema';
import {buildForm} from '../../shared/form/openapi/openapi-form-builder';

@Component({
  imports: [
    TableViewComponent,
    TestFilterComponent
  ],
  template: `
    <app-table-view [orc]="orc" [detailRedirect]="detail">
      <ng-template #filterTemplate let-form="form" let-submitFn="submitFn" let-clearFilter="clearFilter">
        <app-test-filter [form]="form" [submitFn]="submitFn" [clearFilter]="clearFilter"/>
      </ng-template>
      <ng-template #headerTemplate>
        <tr>
          <th class="text-left py-3 px-4">Title</th>
          <th class="text-left py-3 px-4">Category</th>
          <th class="text-left py-3 px-4">Price</th>
        </tr>
      </ng-template>
      <ng-template #bodyTemplate let-row let-rowIndex="rowIndex" let-redirectToDetail="redirectToDetail">
        <tr class="cursor-pointer hover:bg-gray-50" (click)="redirectToDetail(row)">
          <td class="py-3 px-4">{{ row.title }}</td>
          <td class="py-3 px-4">{{ row.category }}</td>
          <td class="py-3 px-4">{{ row.price }}</td>
        </tr>
      </ng-template>
    </app-table-view>
  `
})
export class TestTableComponent {

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
        pageSize: 10,
        pageSizes: [10, 20, 50]
      },
      filterConf: {
        form: buildForm<TestItemListFilter>(OPENAPI_SCHEMA.TestItemListFilter),
        emitOnChange: true,
      },
      statePersistence: {
        mode: 'localStorage',
        key: 'test-table-list-state',
        persistFilter: true,
        persistPage: true
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
