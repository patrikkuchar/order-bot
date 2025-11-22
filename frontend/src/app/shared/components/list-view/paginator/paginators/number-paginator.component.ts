import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PaginatorModule} from 'primeng/paginator';
import {PageMetadata, PageReq} from '../../../../../api';
import {PaginatorState} from 'primeng/paginator';

@Component({
  selector: 'app-number-paginator',
  imports: [
    PaginatorModule
  ],
  template: `
    <p-paginator
      [rows]="pageReq.size"
      [first]="pageReq.number * pageReq.size"
      [rowsPerPageOptions]="itemsPerPageOpts"
      [totalRecords]="pageMetadata?.totalElements ?? 0"
      (onPageChange)="onPageChange($event)"/>
  `
})
export class NumberPaginatorComponent {

  @Input({required: true}) pageReq!: PageReq;
  @Input() pageMetadata: PageMetadata | null = null;
  @Input() itemsPerPageOpts: number[] = [];

  @Output() pageChange = new EventEmitter<PageReq>();

  onPageChange(event: PaginatorState): void {
    const nextSize = Number(event.rows ?? this.pageReq.size);
    const page = event.page ?? Math.floor((event.first ?? 0) / nextSize);
    this.pageChange.emit({
      number: page,
      size: nextSize
    });
  }
}
