import {Component, ContentChild, Input, OnInit, TemplateRef} from '@angular/core';
import {ListViewOrchestrator} from '../list-view.orchestrator';
import {RouteArgs, RoutePath} from '../../../../app/routes/types';
import {NgStyle, NgTemplateOutlet} from '@angular/common';
import {ListFilterComponent} from '../filter/list-filter.component';
import {ListViewComponent} from '../list-view.component';
import {ListNumberPaginatorComponent} from '../paginator/list-number-paginator.component';
import {ListNextPaginatorComponent} from '../paginator/list-next-paginator.component';

export interface GridLayout {
  flow: 'col' | 'row';
  definedNumberOf: 'cols' | 'rows';
  numberOf: number;
  gapX: number;
  gapY: number;
}

export interface FlexLayout {
  direction: 'row' | 'col' | 'row-reverse' | 'column-reverse';
  wrap: 'nowrap' | 'wrap' | 'wrap-reverse';
  gapX: number;
  gapY: number;
}

@Component({
  selector: 'app-layout-view',
  imports: [
    NgTemplateOutlet,
    ListFilterComponent,
    ListViewComponent,
    ListNumberPaginatorComponent,
    ListNextPaginatorComponent,
    NgStyle
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
    <app-list-view [orc]="orc" [detailRedirect]="detailRedirect">
      <ng-template #itemsTemplate let-data="data" let-redirect="redirect" let-isLoading="isLoading">
        <div [class]="layoutClass" [ngStyle]="layoutStyles">
          @if (isLoading) {
            @if (_itemSkeletonTemplate) {
              @for (i of [].constructor(skeletonItemCount); track i) {
                <ng-container *ngTemplateOutlet="_itemSkeletonTemplate"/>
              }
            }
          } @else {
            @for (item of data; track item) {
              <ng-container *ngTemplateOutlet="_itemTemplate; context: { data: item, redirectToDetail: redirect }"/>
            } @empty {
              @if (_emptyTemplate) {
                <ng-container *ngTemplateOutlet="_emptyTemplate"/>
              } @else {
                <div class="p-4 text-center text-gray-500">No items found.</div>
              }
            }
          }
        </div>
      </ng-template>
      @if (_skeletonTemplate) {
        <ng-template #skeletonTemplate>
          <ng-container *ngTemplateOutlet="_skeletonTemplate"/>
        </ng-template>
      }
    </app-list-view>
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
export class LayoutViewComponent<T = any, F = any> implements OnInit {

  @Input({required: true}) orc: ListViewOrchestrator<T, F>;
  @Input() detailRedirect?: (item: T) => RouteArgs<RoutePath>;

  @Input() gridLayout: GridLayout | null;
  @Input() flexLayout: FlexLayout | null;
  @Input() nextPaginatorMode?: 'button' | 'scroll';

  @ContentChild('itemTemplate', {read: TemplateRef, static: true}) _itemTemplate!: TemplateRef<any>;
  @ContentChild('emptyTemplate', {read: TemplateRef, static: false}) _emptyTemplate?: TemplateRef<any>;

  @ContentChild('filterTemplate', {read: TemplateRef, static: false}) _filterTemplate?: TemplateRef<any>;
  @ContentChild('paginatorTemplate', {read: TemplateRef, static: false}) _paginatorTemplate?: TemplateRef<any>;

  @Input() skeletonItemCount: number = 4;
  @ContentChild('itemSkeletonTemplate', {read: TemplateRef, static: false}) _itemSkeletonTemplate?: TemplateRef<any>;

  @ContentChild('skeletonTemplate', {read: TemplateRef, static: false}) _skeletonTemplate?: TemplateRef<any>;

  layoutClass = 'w-full';
  layoutStyles: any = {};

  ngOnInit() {
    if ((this.gridLayout && this.flexLayout) || (!this.gridLayout && !this.flexLayout))
      throw new Error('LayoutViewComponent requires either gridLayout or flexLayout to be set, but not both.');

    if (this.gridLayout) {
      this.layoutClass = `${this.layoutClass} grid grid-flow-${this.gridLayout.flow} grid-${this.gridLayout.definedNumberOf}-${this.gridLayout.numberOf} gap-x-${this.gridLayout.gapX} gap-y-${this.gridLayout.gapY}`;
      this.layoutStyles = {
        'row-gap': `calc(var(--spacing)*${this.gridLayout.gapY})`
      };
    }
    if (this.flexLayout) {
      this.layoutClass = `${this.layoutClass} flex flex-${this.flexLayout.direction} flex-${this.flexLayout.wrap} gap-x-${this.flexLayout.gapX} gap-y-${this.flexLayout.gapY}`;
      this.layoutStyles = {
        'row-gap': `calc(var(--spacing)*${this.flexLayout.gapY})`
      };
    }

    if (this.nextPaginatorMode === undefined) {
      this.nextPaginatorMode = this.orc.nextPageConf?.mode ?? 'button';
    }
  }
}
