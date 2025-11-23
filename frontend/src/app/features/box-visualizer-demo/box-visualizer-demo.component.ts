import {Component, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BoxGraph} from '../../shared/components/box-visualizer/box-visualizer.component';
import {BoxVisualizerComponent} from '../../shared/components/box-visualizer/box-visualizer.component';
import {Button} from 'primeng/button';
import {Card} from 'primeng/card';
import {ToastService} from '../../core/services/toast.service';

@Component({
  selector: 'app-box-visualizer-demo',
  standalone: true,
  imports: [
    CommonModule,
    BoxVisualizerComponent,
    Button,
    Card
  ],
  template: `
    <p-card header="Box visualizer demo" class="demo-card">
      <p class="mb-3">
        Ukážka ako použiť <code>app-box-visualizer</code>. Zmeny (posun boxu, pripojenie/odpojenie) sa vracajú cez
        <code>graphChange</code>. Klikni na šedé pozadie a ťahaj, aby si posunul canvas.
      </p>

      <div class="mb-3 flex gap-2">
        <button pButton type="button" label="Reset" icon="pi pi-refresh" (click)="reset()"></button>
      </div>

      <app-box-visualizer
        [graph]="graph()"
        [selectedNodeId]="selectedNodeId()"
        (graphChange)="graph.set($event)"
        (selectedNodeIdChange)="onNodeSelected($event)"
      ></app-box-visualizer>

      <p class="mt-4 text-sm text-color-secondary">
        Aktuálny graph (na debug):
      </p>
      <pre class="graph-preview">{{ graph() | json }}</pre>
      <p class="mt-2 text-sm text-color-secondary">
        Aktuálne vybraný uzol: <strong>{{ selectedNodeId() ?? 'žiadny' }}</strong>
      </p>
    </p-card>
  `,
  styles: [`
    :host {
      display: block;
      padding: 1rem;
    }

    .demo-card {
      width: 100%;
    }

    .graph-preview {
      background: #0b1424;
      color: #d2d7e2;
      border-radius: 8px;
      padding: 0.75rem;
      overflow-x: auto;
    }

    @media (prefers-color-scheme: light) {
      .graph-preview {
        background: #f6f7fb;
        color: #2a3243;
      }
    }
  `]
})
export class BoxVisualizerDemoComponent {
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
  selectedNodeId = signal<string | null>(null);

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
    this.selectedNodeId.set(null);
  }

  onNodeSelected(nodeId: string | null): void {
    this.selectedNodeId.set(nodeId);

    if (!nodeId) {
      return;
    }

    const found = this.graph().nodes.find(n => n.id === nodeId);
    const label = found?.label ?? nodeId;
    this.toastSvc.info(`Klikol si na uzol "${label}"`, 'Výber prvku');
  }

  constructor(private toastSvc: ToastService) {
    this.reset();
  }
}
