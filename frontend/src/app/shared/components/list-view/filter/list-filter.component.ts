import {Component, ContentChild, Input, OnInit, TemplateRef} from '@angular/core';
import {debounceTime} from 'rxjs';
import {DestroyableDirective} from '../../../directives/destroyable.directive';
import {ListViewOrchestrator} from '../list-view.orchestrator';
import {NgTemplateOutlet} from '@angular/common';
import {CustomFormGroup} from '../../../form/custom/custom-form-group';

@Component({
  selector: 'app-list-filter',
  imports: [
    NgTemplateOutlet
  ],
  template: `
    @if(orc) {
      <ng-container *ngTemplateOutlet="filterTemplate; context: { form, submitFn: submitFnBound, clearFilter: clearFilterBound }"/>
    }
  `
})
export class ListFilterComponent<F = any> extends DestroyableDirective implements OnInit {

  @Input({required: true}) orc: ListViewOrchestrator<any, F>

  form: CustomFormGroup<F>;

  // bound functions to preserve `this` when template calls them
  submitFnBound: () => void = () => {};
  clearFilterBound: () => void = () => {};

  @ContentChild('filterTemplate', {read: TemplateRef, static: true}) filterTemplate!: TemplateRef<any>;

  ngOnInit() {
    if (!this.orc.filterConf) throw new Error('ListFilterComponent requires ListViewOrchestrator with filterConf defined');

    this.form = this.orc.filterConf.form;
    console.log('Initialized ListFilterComponent with form:', this.form);

    // bind functions so `this` inside submitFilter/clearFilter points to this component
    this.submitFnBound = this.submitFilter.bind(this);
    this.clearFilterBound = this.clearFilter.bind(this);

    if (this.orc.filterConf.emitOnChange) {
      this.form.valueChanges.pipe(
        debounceTime(300),
        this.untilDestroy()
      ).subscribe(() => this.submitFilter());
    }
  }

  submitFilter(): void {
    if (!this.form) {
      console.warn('ListFilterComponent.submitFilter called but form is not initialized');
      return;
    }
    if (this.form.valid) this.orc.updateFilter(this.form.getValue());
  }

  clearFilter(): void {
    if (!this.form) {
      console.warn('ListFilterComponent.clearFilter called but form is not initialized');
      return;
    }
    this.form.reset();
    this.submitFilter();
  }
}
