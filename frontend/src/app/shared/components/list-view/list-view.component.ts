import {Component, ContentChild, Input, OnInit, TemplateRef} from '@angular/core';
import {RouteArgs, RoutePath} from '../../../app/routes/types';
import {NgTemplateOutlet} from '@angular/common';
import {RedirectService} from '../../../core/services/redirect.service';
import {ListViewOrchestrator} from './list-view.orchestrator';

@Component({
  selector: 'app-list-view',
  imports: [
    NgTemplateOutlet
  ],
  template: `
    @if (skeletonTemplate) {
      @if (orc.isLoading()) {
        <ng-container *ngTemplateOutlet="skeletonTemplate"/>
      } @else {
        <ng-container *ngTemplateOutlet="itemsTemplate; context: { data: orc.data(), redirect: detailFn, isLoading: orc.isLoading() }"/>
      }
    } @else {
      <ng-container *ngTemplateOutlet="itemsTemplate; context: { data: orc.data(), redirect: detailFn, isLoading: orc.isLoading() }"/>
    }
  `
})
export class ListViewComponent<T = any, F = any> implements OnInit {

  @Input({required: true}) orc: ListViewOrchestrator<T, F>;

  @Input() detailRedirect?: (item: T) => RouteArgs<RoutePath>;

  // look for template reference name used by the parent: #itemsTemplate
  @ContentChild('itemsTemplate', {read: TemplateRef, static: true}) itemsTemplate!: TemplateRef<any>;

  @ContentChild('skeletonTemplate', {read: TemplateRef, static: false}) skeletonTemplate?: TemplateRef<any>;

  detailFn: (item: T) => void;

  constructor(private redirectSvc: RedirectService) { }

  ngOnInit(): void {
    this.detailFn = (item: T): void => {
      if (!this.detailRedirect) return;
      const redirect = this.detailRedirect(item);
      this.redirectSvc.to(redirect.pathFn, undefined, ...(redirect.args ?? []));
    }
  }
}
