import {Component} from '@angular/core';
import {Card} from 'primeng/card';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-connection-panel',
  imports: [
    Card,
    NgClass
  ],
  styles: [`
    :host ::ng-deep .connection-card {
      background-color: var(--p-surface-menu);
      border-color: var(--p-surface-border, rgba(0,0,0,0.08));
      color: var(--p-text-color);
    }
  `],
  template: `
    <div class="h-full min-w-[25rem]">
      <p-card title="Connections" styleClass="connection-card" ngClass="h-full min-h-full">
        <h1>Connections</h1>
      </p-card>
    </div>
  `
})
export class ConnectionPanelComponent {

}
