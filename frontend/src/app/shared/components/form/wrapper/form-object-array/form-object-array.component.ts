import {Component, ContentChild, Input, TemplateRef} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {Button} from 'primeng/button';
import {CustomFormGroup} from '../../../../form/custom/custom-form-group';
import {FormArrayDirective} from '../form-array/form-array.directive';

@Component({
  selector: 'app-form-object-array',
  imports: [
    NgTemplateOutlet,
    Button
  ],
  templateUrl: './form-object-array.component.html'
})
export class FormObjectArrayComponent<T, G extends CustomFormGroup<T>> extends FormArrayDirective<G> {
  /** layout */
  @Input() layout: 'horizontal' | 'vertical' = 'vertical';
  @Input() itemsLayout: 'horizontal' | 'vertical' = 'horizontal';

  /** gap style, simple string like '1rem' */
  @Input() layoutGap: string | null = '1rem';
  @Input() itemsGap: string | null = '1rem';

  @Input() showRemoveButton: boolean = true;
  @Input() showNoItemsDiv: boolean = true;

  @ContentChild('itemTemplate', {read: TemplateRef, static: true}) itemTemplate!: TemplateRef<any>;

  // Optional templates provided by the consumer
  @ContentChild('addButton', {read: TemplateRef}) addButtonTemplate?: TemplateRef<any>;
  @ContentChild('removeButton', {read: TemplateRef}) removeButtonTemplate?: TemplateRef<any>;
  @ContentChild('noItems', {read: TemplateRef}) noItemsTemplate?: TemplateRef<any>;

  // bound function properties so template can pass them into template context without arrow funcs
  public removeFn = (i: number) => this.remove(i);
  public addFn = () => this.add();

  add(): void {
    this.array.add();
  }

  remove(i: number): void {
    this.array.removeAt(i);
  }
}
