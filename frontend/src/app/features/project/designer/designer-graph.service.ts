import {computed, Injectable, signal} from '@angular/core';
import {
  BoxConnection,
  BoxGraph,
  BoxNodeDefinition,
  BoxNodePositionChange
} from '../../../shared/components/box-visualizer/box-visualizer.component';
import {TemplateStepPosition, WipStepCreateData, WipStepListRes, WipStepNodeData, WipStepPosition} from '../../../api';

@Injectable({
  providedIn: 'root'
})
export class DesignerGraphService {

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

  updateGraph(data: WipStepListRes): void {
    this.graph.set({
      nodes: data.steps.map(step => ({
        id: step.stepNumber,
        label: step.nodeData.title,
        position: {
          x: step.nodePosition.x,
          y: step.nodePosition.y
        },
        inputs: step.nodeData.inputs.map(i => ({
          key: i.key,
          label: i.label,
          multiple: true
        })),
        outputs: step.nodeData.outputs.map(o => ({
          key: o.key,
          label: o.label,
          multiple: false
        }))
      })),
      connections: data.connections.map(conn => ({
        id: conn.id,
        source: conn.sourceStepNumber,
        target: conn.targetStepNumber,
        sourceOutput: conn.sourceOutput,
        targetInput: conn.targetInput
      }))
    });
  }

  setGraph(graph: BoxGraph | null): void {
    this.graph.set(graph);
  }

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
    this.setGraph(graph);
    this.updateSelectedNode(null);
  }

  createConnection(connection: BoxConnection, newId: string): void {
    const currentGraph = this.graph();
    if (!currentGraph) return;

    this.graph.set({
      ...currentGraph,
      connections: [
        ...currentGraph.connections.filter(c => c.id !== connection.id),
        { ...connection, id: newId }
      ]
    });
  }

  removeConnection(connectionId: string): void {
    const currentGraph = this.graph();
    if (!currentGraph) return;

    this.graph.set({
      ...currentGraph,
      connections: currentGraph.connections.filter(c => c.id !== connectionId)
    });
  }

  updateLocation(change: BoxNodePositionChange): void {
    const currentGraph = this.graph();
    if (!currentGraph) return;

    this.graph.set({
      ...currentGraph,
      nodes: currentGraph.nodes.map(node =>
        node.id === change.nodeId
          ? { ...node, position: { x: change.position.x, y: change.position.y } }
          : node
      )
    });
  }

  connectionsToRemoveForNode(nodeId: string): string[] {
    const currentGraph = this.graph();
    if (!currentGraph) return [];

    return currentGraph.connections
      .filter(conn => conn.source === nodeId || conn.target === nodeId)
      .map(conn => conn.id);
  }

  removeNodeAndConn(nodeId: string): void {
    const currentGraph = this.graph();
    if (!currentGraph) return;

    this.graph.set({
      nodes: currentGraph.nodes.filter(node => node.id !== nodeId),
      connections: currentGraph.connections.filter(
        conn => conn.source !== nodeId && conn.target !== nodeId
      )
    });
  }

  addNode(node: WipStepCreateData): void {
    const currentGraph = this.graph();
    if (!currentGraph) return;

    this.graph.set({
      ...currentGraph,
      nodes: [
        ...currentGraph.nodes,
        {
          id: node.stepNumber,
          label: node.nodeData.title,
          position: {
            x: node.gridPosition.x,
            y: node.gridPosition.y
          },
          inputs: node.nodeData.inputs.map(i => ({
            key: i.key,
            label: i.label,
            multiple: true
          })),
          outputs: node.nodeData.outputs.map(o => ({
            key: o.key,
            label: o.label,
            multiple: false
          }))
        }
      ]
    });
  }

  updateNode(nodeId: string, node: WipStepNodeData): void {
    const currentGraph = this.graph();
    if (!currentGraph) return;

    this.graph.set({
      ...currentGraph,
      nodes: currentGraph.nodes.map(n =>
        n.id === nodeId
          ? {
              ...n,
              label: node.title,
              inputs: node.inputs.map(i => ({
                key: i.key,
                label: i.label,
                multiple: true
              })),
              outputs: node.outputs.map(o => ({
                key: o.key,
                label: o.label,
                multiple: false
              }))
            }
          : n
      )
    });
  }

  public updateSelectedNode(nodeId: string | null): void {
    const currentGraph = this.graph();
    if (!currentGraph) return;
    const hasNode = nodeId ? currentGraph.nodes.some(node => node.id === nodeId) : false;
    this.selectedNodeId.set(hasNode ? nodeId : null);
  }
}
