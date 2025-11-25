import {Component} from '@angular/core';
import {Card} from 'primeng/card';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-manager-panel',
  imports: [
    Card,
    NgClass
  ],
  template: `
    <div class="h-full">
      <p-card title="Connections" ngClass="h-full min-h-full">
        <h1>Manager</h1>
      </p-card>
    </div>
  `
})
export class ManagerPanelComponent {

}
