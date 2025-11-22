import {Component, ContentChild, Input, OnInit, TemplateRef} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {ListViewOrchestrator} from '../list-view.orchestrator';
import {PageMetadata, PageReq} from '../../../../api';
import {NumberPaginatorComponent} from './paginators/number-paginator.component';

@Component({
  selector: 'app-list-number-paginator',
  imports: [
    NgTemplateOutlet,
    NumberPaginatorComponent
  ],
  template: `
    @if (paginatorTemplate) {
      <ng-container
        *ngTemplateOutlet="paginatorTemplate; context: { pageReqFn, pageMetadata, pageReqData: pageReq }"/>
    } @else {
      <app-number-paginator
        [pageReq]="pageReq"
        [pageMetadata]="pageMetadata"
        [itemsPerPageOpts]="itemsPerPageOpts"
        (pageChange)="pageReqFn($event)"/>
    }
  `
})
export class ListNumberPaginatorComponent implements OnInit {

  @Input({required: true}) orc: ListViewOrchestrator;

  itemsPerPageOpts: number[] = [];

  @ContentChild('paginatorTemplate', {read: TemplateRef, static: false}) paginatorTemplate?: TemplateRef<any>;

  readonly pageReqFn = (pageReq: PageReq) => this.orc.updatePageReq(pageReq);
  ngOnInit() {
    const conf = this.orc.numberPageConf;
    if (!conf) throw new Error('NumberPaginator used with an orchestrator that does not support number page configuration');

    const sizes = new Set<number>(conf.pageSizes.length ? conf.pageSizes : [conf.pageSize]);
    sizes.add(conf.pageSize);
    this.itemsPerPageOpts = Array.from(sizes).sort((a, b) => a - b);
  }

  get pageMetadata(): PageMetadata | null {
    return this.orc.pageMetadata();
  }

  get pageReq(): PageReq {
    return this.orc.pageReq();
  }
}
