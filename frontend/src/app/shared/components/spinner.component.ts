import {Component} from '@angular/core';
import {ProgressSpinner} from 'primeng/progressspinner';

@Component({
  selector: 'app-spinner',
  imports: [
    ProgressSpinner
  ],
  template: `
    <div class="loading-container">
      <p-progress-spinner strokeWidth="8" fill="transparent" animationDuration=".8s" [style]="{ width: '50px', height: '50px' }"/>
    </div>
  `,
  styles: `
    .loading-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }

    @media (prefers-color-scheme: dark) {
      .loading-container {
        background-color: rgba(30, 30, 30, 0.8);
      }
    }
  `
})
export class SpinnerComponent {

}
