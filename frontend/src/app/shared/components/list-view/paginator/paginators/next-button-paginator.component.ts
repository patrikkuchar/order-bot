import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ButtonModule} from 'primeng/button';

@Component({
  selector: 'app-next-button-paginator',
  imports: [
    ButtonModule
  ],
  template: `
    <div class="flex justify-center py-4">
      <p-button
        severity="secondary"
        label="{{ label }}"
        [disabled]="!canLoadMore || isLoading"
        [loading]="isLoading"
        (onClick)="triggerLoad()"/>
    </div>
  `
})
export class NextButtonPaginatorComponent {

  @Input() label = 'Load more';
  @Input() canLoadMore = true;
  @Input() isLoading = false;

  @Output() loadMore = new EventEmitter<void>();

  triggerLoad(): void {
    if (this.canLoadMore && !this.isLoading) {
      this.loadMore.emit();
    }
  }
}
