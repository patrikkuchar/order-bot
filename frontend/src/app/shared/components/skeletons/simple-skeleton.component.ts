import {Component} from '@angular/core';
import {Skeleton} from 'primeng/skeleton';

@Component({
  selector: 'app-simple-skeleton',
  imports: [Skeleton],
  template: `
    <p-skeleton class="mb-2" borderRadius="16px" />
    <p-skeleton width="10rem" class="mb-2" borderRadius="16px" />
    <p-skeleton width="5rem" class="mb-2" borderRadius="16px" />
    <p-skeleton height="2rem" class="mb-2" borderRadius="16px" />
    <p-skeleton width="10rem" height="4rem" borderRadius="16px" />
  `
})
export class SimpleSkeletonComponent {
}

