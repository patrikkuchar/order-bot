import {computed, Injectable, signal} from '@angular/core';
import {BoxGraph, BoxNodeDefinition} from '../../../shared/components/box-visualizer/box-visualizer.component';

@Injectable({
  providedIn: 'root'
})
export class DesignerService {

  selectedNodeId = signal<string | null>(null);
  graph = signal<BoxGraph | null>(null);

  selectedNode = computed<BoxNodeDefinition | null>(() => {
    const nodeId = this.selectedNodeId();
    const graph = this.graph();

    if (!graph || !nodeId) {
      return null;
    }

    return graph.nodes.find(node => node.id === nodeId) ?? null;
  });

  setGraph(graph: BoxGraph | null): void {
    this.graph.set(graph);
  }
}
