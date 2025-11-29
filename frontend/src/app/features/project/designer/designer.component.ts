import {Component, effect, Signal, signal} from '@angular/core';
import {Card} from 'primeng/card';
import {ConnectionPanelComponent} from './panels/connection-panel.component';
import {ManagerPanelComponent} from './panels/manager-panel.component';
import {Button} from 'primeng/button';
import {BoxGraph, BoxVisualizerComponent} from '../../../shared/components/box-visualizer/box-visualizer.component';
import {NgClass} from '@angular/common';
import {DesignerService} from './designer.service';
import {BaseRouteDirective} from '../../../shared/directives/base-route.directive';
import {ProjectRoutes} from '../project.routes';
import {RedirectService} from '../../../core/services/redirect.service';

@Component({
  imports: [
    Card,
    ConnectionPanelComponent,
    ManagerPanelComponent,
    Button,
    BoxVisualizerComponent
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
                (graphChange)="onGraphChange($event)"
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
export class DesignerComponent extends BaseRouteDirective {
  private readonly initialGraph: BoxGraph = {
    nodes: [
      {
        id: 'n1',
        label: 'Ingress',
        position: {x: 80, y: 100},
        outputs: [{key: 'next', label: 'Next'}]
      },
      {
        id: 'n2',
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
      {id: 'c1', source: 'n1', sourceOutput: 'next', target: 'n2', targetInput: 'input'},
      {id: 'c2', source: 'n2', sourceOutput: 'out', target: 'payment', targetInput: 'in'}
    ]
  };

  graph = signal<BoxGraph>(this.initialGraph);
  selectedNodeId: Signal<string | null>;
  private readonly projectId = this.param('projectId');
  private readonly routeNodeId = this.param('nodeId');

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
    const graph = this.graph();
    this.svc.setGraph(graph);
    this.updateSelectedNode(null);
  }

  onNodeSelected(nodeId: string | null): void {
    console.log('Node selected:', nodeId);
    this.updateSelectedNode(nodeId);

    if (!nodeId) {
      this.navigateToNode(null);
      return;
    }

    this.navigateToNode(nodeId);
  }

  onGraphChange(updatedGraph: BoxGraph): void {
    this.graph.set(updatedGraph);
    this.svc.setGraph(updatedGraph);
  }

  private updateSelectedNode(nodeId: string | null): void {
    const currentGraph = this.graph();
    const hasNode = nodeId ? currentGraph.nodes.some(node => node.id === nodeId) : false;
    this.svc.selectedNodeId.set(hasNode ? nodeId : null);
  }

  private navigateToNode(nodeId: string | null): void {
    const pid = this.projectId();
    if (!pid) {
      return;
    }

    this.redirectSvc.to(ProjectRoutes.of(pid).designer, undefined, nodeId ?? undefined);
  }

  constructor(private svc: DesignerService,
              private redirectSvc: RedirectService) {
    super();
    this.selectedNodeId = this.svc.selectedNodeId.asReadonly();
    this.reset();

    effect(() => {
      const nodeId = this.routeNodeId();
      this.updateSelectedNode(nodeId);
    });
  }
}
