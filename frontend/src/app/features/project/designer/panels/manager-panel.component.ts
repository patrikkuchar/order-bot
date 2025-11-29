import {Component, Signal} from '@angular/core';
import {Card} from 'primeng/card';
import {NgClass, NgIf, NgFor} from '@angular/common';
import {DesignerService} from '../designer.service';
import {BoxNodeDefinition} from '../../../../shared/components/box-visualizer/box-visualizer.component';

@Component({
  selector: 'app-manager-panel',
  imports: [
    Card,
    NgClass,
    NgIf,
    NgFor
  ],
  template: `
    <div class="h-full">
      <p-card title="Manager" ngClass="h-full min-h-full">
        <ng-container *ngIf="selectedNode() as node; else noSelection" >
          <div class="flex flex-col gap-3">
            <div>
              <div class="text-sm text-color-secondary">Name</div>
              <div class="text-lg font-semibold">{{ node.label }}</div>
              <div class="text-xs text-color-secondary">ID: {{ node.id }}</div>
            </div>

            <div *ngIf="node.inputs?.length">
              <div class="font-medium mb-1">Inputs</div>
              <ul class="list-disc list-inside text-sm text-color-secondary">
                <li *ngFor="let input of node.inputs">
                  {{ input.label || input.key }} ({{ input.key }})
                </li>
              </ul>
            </div>

            <div *ngIf="node.outputs?.length">
              <div class="font-medium mb-1">Outputs</div>
              <ul class="list-disc list-inside text-sm text-color-secondary">
                <li *ngFor="let output of node.outputs">
                  {{ output.label || output.key }} ({{ output.key }})
                </li>
              </ul>
            </div>
          </div>
        </ng-container>

        <ng-template #noSelection>
          <p class="text-color-secondary">Select a node in the designer to see its details here.</p>
        </ng-template>
      </p-card>
    </div>
  `
})
export class ManagerPanelComponent {

  selectedNode: Signal<BoxNodeDefinition | null>;

  constructor(svc: DesignerService) {
    this.selectedNode = svc.selectedNode;
  }
}
