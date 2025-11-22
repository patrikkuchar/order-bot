import {AfterViewInit, Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy, Output, ViewChild} from '@angular/core';

@Component({
  selector: 'app-next-scroll-paginator',
  template: `
    <div class="flex justify-center py-4 text-sm text-gray-500">{{ statusMessage }}</div>
    <div #anchor aria-hidden="true"></div>
  `
})
export class NextScrollPaginatorComponent implements AfterViewInit, OnDestroy {

  @Input() canLoadMore = true;
  @Input() isLoading = false;

  @Output() loadMore = new EventEmitter<void>();

  @ViewChild('anchor', {static: true}) anchor!: ElementRef<HTMLDivElement>;

  private observer?: IntersectionObserver;

  constructor(private readonly zone: NgZone) {}

  get statusMessage(): string {
    if (this.isLoading) return 'Loading more...';
    if (!this.canLoadMore) return 'No more items';
    return 'Scroll to load more';
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && this.canLoadMore && !this.isLoading) {
            this.zone.run(() => this.loadMore.emit());
          }
        });
      }, {
        threshold: 0.1
      });
      if (this.anchor?.nativeElement) {
        this.observer.observe(this.anchor.nativeElement);
      }
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
