import {Component, Signal, signal} from '@angular/core';
import {Card} from 'primeng/card';
import {ConnectionPanelComponent} from './panels/connection-panel.component';
import {ManagerPanelComponent} from './panels/manager-panel.component';
import {Button} from 'primeng/button';
import {BoxGraph, BoxVisualizerComponent} from '../../../shared/components/box-visualizer/box-visualizer.component';
import {ToastService} from '../../../core/services/toast.service';
import {NgClass} from '@angular/common';
import {DesignerService} from './designer.service';

@Component({
  imports: [
    Card,
    ConnectionPanelComponent,
    ManagerPanelComponent,
    Button,
    BoxVisualizerComponent,
    NgClass
  ],
  styles: [`
    :host {
      display: block;
      height: 100%;
      min-height: 0;
    }

    :host ::ng-deep .designer-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
    }

    :host ::ng-deep .designer-card .p-card-body {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-height: 0;
    }

    :host ::ng-deep .designer-card .p-card-content {
      display: flex;
      flex: 1 1 auto;
      min-height: 0;
    }

    :host ::ng-deep .designer-card app-box-visualizer {
      flex: 1 1 auto;
      min-height: 0;
    }
  `],
  template: `
      <div class="flex flex-col gap-4 h-full min-h-0">
        <p-card styleClass="designer-card" class="grow min-h-0">
          <div class="grow flex flex-row min-h-0 gap-4">
            <div class="flex flex-col gap-4 min-h-0">
              <p-button icon="pi pi-plus" [rounded]="true" />
              <p-button icon="pi pi-trash" [rounded]="true" severity="danger" [disabled]="!selectedNodeId()" class="flex-auto" />
              <p-button icon="pi pi-save" [rounded]="true" severity="secondary" />
            </div>
            <div class="min-h-0 grow">
              <app-box-visualizer
                class="h-full block"
                [graph]="graph()"
                [selectedNodeId]="selectedNodeId()"
                (graphChange)="graph.set($event)"
                (selectedNodeIdChange)="onNodeSelected($event)"
              ></app-box-visualizer>
            </div>
          </div>
        </p-card>
        <div class="flex flex-row gap-4 w-full min-h-[20rem]">
          <div class="grow min-h-full">
            <app-manager-panel/>
          </div>
          <div class="min-h-full">
            <app-connection-panel/>
          </div>
        </div>
      </div>

  `
})
export class DesignerComponent {
  private readonly initialGraph: BoxGraph = {
    nodes: [
      {
        id: 'ingress',
        label: 'Ingress',
        position: {x: 80, y: 100},
        outputs: [{key: 'next', label: 'Next'}]
      },
      {
        id: 'prepare',
        label: 'Prepare order',
        position: {x: 320, y: 140},
        inputs: [{key: 'input', label: 'Input'}],
        outputs: [{key: 'out', label: 'Out'}]
      },
      {
        id: 'payment',
        label: 'Payment',
        position: {x: 560, y: 220},
        inputs: [{key: 'in', label: 'In'}],
        outputs: [{key: 'ok', label: 'OK'}, {key: 'fail', label: 'Fail'}]
      }
    ],
    connections: [
      {id: 'c1', source: 'ingress', sourceOutput: 'next', target: 'prepare', targetInput: 'input'},
      {id: 'c2', source: 'prepare', sourceOutput: 'out', target: 'payment', targetInput: 'in'}
    ]
  };

  graph = signal<BoxGraph>(this.initialGraph);
  selectedNodeId: Signal<string | null>;

  reset(): void {
    // Deep-ish copy to avoid reference reuse
    this.graph.set({
      nodes: this.initialGraph.nodes.map(node => ({
        ...node,
        position: node.position ? {...node.position} : undefined,
        inputs: node.inputs ? node.inputs.map(i => ({...i})) : [],
        outputs: node.outputs ? node.outputs.map(o => ({...o})) : []
      })),
      connections: this.initialGraph.connections.map(conn => ({...conn}))
    });
    this.updateSelectedNode(null);
  }

  onNodeSelected(nodeId: string | null): void {
    this.updateSelectedNode(nodeId);

    if (!nodeId) {
      return;
    }

    const found = this.graph().nodes.find(n => n.id === nodeId);
    const label = found?.label ?? nodeId;
  }

  private updateSelectedNode(nodeId: string | null): void {
    this.svc.selectedNodeId.set(nodeId);
  }

  constructor(private svc: DesignerService) {
    this.selectedNodeId = this.svc.selectedNodeId.asReadonly();
    this.reset();
  }
}
