import {Component, ContentChild, Input, OnInit, TemplateRef} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {TableModule} from 'primeng/table';
import {ListViewOrchestrator} from '../list-view.orchestrator';
import {RouteArgs, RoutePath} from '../../../../app/routes/types';
import {RedirectService} from '../../../../core/services/redirect.service';
import {ListFilterComponent} from '../filter/list-filter.component';
import {ListNumberPaginatorComponent} from '../paginator/list-number-paginator.component';
import {ListNextPaginatorComponent} from '../paginator/list-next-paginator.component';

@Component({
  selector: 'app-table-view',
  imports: [
    TableModule,
    NgTemplateOutlet,
    ListFilterComponent,
    ListNumberPaginatorComponent,
    ListNextPaginatorComponent
  ],
  template: `
    @if (_filterTemplate) {
      <app-list-filter [orc]="orc">
        <ng-template #filterTemplate let-form="form" let-submitFn="submitFn" let-clearFilter="clearFilter">
          <ng-container
            *ngTemplateOutlet="_filterTemplate; context: { form, submitFn, clearFilter }"/>
        </ng-template>
      </app-list-filter>
    }

    <p-table
      [value]="orc.data() ?? []"
      [loading]="orc.isLoading()"
      [tableStyle]="tableStyle"
      [tableStyleClass]="tableClass"
      [responsiveLayout]="responsiveLayout"
      [rowHover]="rowHover">
      @if (_captionTemplate) {
        <ng-template pTemplate="caption">
          <ng-container *ngTemplateOutlet="_captionTemplate"/>
        </ng-template>
      }
      @if (_headerTemplate) {
        <ng-template pTemplate="header">
          <ng-container *ngTemplateOutlet="_headerTemplate"/>
        </ng-template>
      }
      <ng-template pTemplate="body" let-row let-rowIndex="rowIndex">
        <ng-container *ngTemplateOutlet="_bodyTemplate; context: tableBodyContext(row, rowIndex)"/>
      </ng-template>
      @if (_footerTemplate) {
        <ng-template pTemplate="footer">
          <ng-container *ngTemplateOutlet="_footerTemplate; context: { data: orc.data() ?? [] }"/>
        </ng-template>
      }
      <ng-template pTemplate="emptymessage">
        @if (_emptyTemplate) {
          <ng-container *ngTemplateOutlet="_emptyTemplate"/>
        } @else {
          <div class="py-6 text-center text-sm text-gray-500">No records available.</div>
        }
      </ng-template>
      <ng-template pTemplate="loadingbody">
        @if (_loadingTemplate) {
          <ng-container *ngTemplateOutlet="_loadingTemplate"/>
        } @else {
          <tr>
            <td [attr.colspan]="loadingColspan" class="py-4 text-center text-sm text-gray-500">
              Loading...
            </td>
          </tr>
        }
      </ng-template>
    </p-table>

    @if (orc.paginatorType === 'number') {
      <app-list-number-paginator [orc]="orc">
        @if (_paginatorTemplate) {
          <ng-template #paginatorTemplate let-pageReqFn="pageReqFn" let-pageMetadata="pageMetadata" let-pageReqData="pageReqData">
            <ng-container *ngTemplateOutlet="_paginatorTemplate; context: { pageReqFn, pageMetadata, pageReqData }"/>
          </ng-template>
        }
      </app-list-number-paginator>
    } @else if (orc.paginatorType === 'next') {
      <app-list-next-paginator [orc]="orc" [mode]="nextPaginatorMode ?? 'button'">
        @if (_paginatorTemplate) {
          <ng-template #paginatorTemplate let-loadMoreFn="loadMoreFn" let-canLoadMore="canLoadMore">
            <ng-container *ngTemplateOutlet="_paginatorTemplate; context: { loadMoreFn, canLoadMore }"/>
          </ng-template>
        }
      </app-list-next-paginator>
    }
  `
})
export class TableViewComponent<T = any, F = any> implements OnInit {

  @Input({required: true}) orc: ListViewOrchestrator<T, F>;
  @Input() detailRedirect?: (item: T) => RouteArgs<RoutePath>;

  @Input() tableStyle: Record<string, any> | null = null;
  @Input() tableClass = 'w-full';
  @Input() rowHover = true;
  @Input() responsiveLayout: 'scroll' | 'stack' = 'scroll';
  @Input() loadingColspan = 100;
  @Input() nextPaginatorMode?: 'button' | 'scroll';

  @ContentChild('captionTemplate', {read: TemplateRef, static: false}) _captionTemplate?: TemplateRef<any>;
  @ContentChild('headerTemplate', {read: TemplateRef, static: false}) _headerTemplate?: TemplateRef<any>;
  @ContentChild('bodyTemplate', {read: TemplateRef, static: true}) _bodyTemplate!: TemplateRef<any>;
  @ContentChild('footerTemplate', {read: TemplateRef, static: false}) _footerTemplate?: TemplateRef<any>;
  @ContentChild('emptyTemplate', {read: TemplateRef, static: false}) _emptyTemplate?: TemplateRef<any>;
  @ContentChild('loadingTemplate', {read: TemplateRef, static: false}) _loadingTemplate?: TemplateRef<any>;
  @ContentChild('filterTemplate', {read: TemplateRef, static: false}) _filterTemplate?: TemplateRef<any>;
  @ContentChild('paginatorTemplate', {read: TemplateRef, static: false}) _paginatorTemplate?: TemplateRef<any>;

  detailFn: (item: T) => void = () => {};

  constructor(private readonly redirectSvc: RedirectService) {}

  ngOnInit(): void {
    if (!this._bodyTemplate) {
      throw new Error('TableViewComponent requires a bodyTemplate to render rows.');
    }

    this.detailFn = (item: T) => {
      if (!this.detailRedirect) return;
      const redirect = this.detailRedirect(item);
      this.redirectSvc.to(redirect.pathFn, undefined, ...(redirect.args ?? []));
    };

    if (this.nextPaginatorMode === undefined) {
      this.nextPaginatorMode = this.orc.nextPageConf?.mode ?? 'button';
    }
  }

  tableBodyContext(row: T, rowIndex: number) {
    const pageReq = this.orc.pageReq();
    return {
      $implicit: row,
      rowIndex,
      globalIndex: rowIndex + (pageReq.number * pageReq.size),
      redirectToDetail: this.detailFn,
      pageReq,
      pageMetadata: this.orc.pageMetadata()
    };
  }
}
