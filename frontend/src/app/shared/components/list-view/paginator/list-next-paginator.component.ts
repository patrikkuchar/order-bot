import {Component, ContentChild, Input, OnInit, TemplateRef} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {ListViewOrchestrator} from '../list-view.orchestrator';
import {NextButtonPaginatorComponent} from './paginators/next-button-paginator.component';
import {NextScrollPaginatorComponent} from './paginators/next-scroll-paginator.component';

@Component({
  selector: 'app-list-next-paginator',
  imports: [
    NgTemplateOutlet,
    NextButtonPaginatorComponent,
    NextScrollPaginatorComponent
  ],
  template: `
    @if (paginatorTemplate) {
      <ng-container
        *ngTemplateOutlet="paginatorTemplate; context: { loadMoreFn, canLoadMore: true }"/>
    } @else {
      @if (mode === 'scroll') {
        <app-next-scroll-paginator
          [canLoadMore]="true"
          [isLoading]="orc.isLoading()"
          (loadMore)="loadMoreFn()"/>
      } @else {
        <app-next-button-paginator
          [canLoadMore]="true"
          [isLoading]="orc.isLoading()"
          (loadMore)="loadMoreFn()"/>
      }
    }
  `
})
export class ListNextPaginatorComponent implements OnInit {

  @Input({required: true}) orc: ListViewOrchestrator;

  nextItemsPage: number;

  private _mode: 'button' | 'scroll' = 'button';
  private modeExplicitlySet = false;

  @Input()
  set mode(value: 'button' | 'scroll') {
    this._mode = value;
    this.modeExplicitlySet = true;
  }

  get mode(): 'button' | 'scroll' {
    return this._mode;
  }

  @ContentChild('paginatorTemplate', {read: TemplateRef, static: false}) paginatorTemplate?: TemplateRef<any>;

  ngOnInit() {
    const conf = this.orc.nextPageConf;
    if (!conf) throw new Error('NextPaginator used with an orchestrator that does not support next page configuration');

    this.nextItemsPage = conf.nextPagesSize || conf.firstPageSize;

    if (!this.modeExplicitlySet && conf.mode) {
      this._mode = conf.mode;
    }
  }

  loadMoreFn() {
    this.orc.updatePageReq({
      number: this.orc.pageReq().number + 1,
      size: this.nextItemsPage
    });
  }
}
