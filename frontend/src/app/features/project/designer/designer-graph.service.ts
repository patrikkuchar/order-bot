import {computed, Injectable, signal} from '@angular/core';
import {
  BoxConnection,
  BoxGraph,
  BoxNodeDefinition,
  BoxNodePositionChange, BoxPort
} from '../../../shared/components/box-visualizer/box-visualizer.component';
import {WipStepCreateData, WipStepListConnectionNode, WipStepListRes, WipStepNodeData} from '../../../api';

@Injectable({
  providedIn: 'root'
})
export class DesignerGraphService {

  private readonly invisibleIfOne = true;

  private readonly initialGraph: BoxGraph = {
    nodes: [],
    connections: []
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
        inputs: this.mapInputConnections(step.nodeData.inputs),
        outputs: this.mapOutputConnections(step.nodeData.outputs)
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
          inputs: this.mapInputConnections(node.nodeData.inputs),
          outputs: this.mapOutputConnections(node.nodeData.outputs)
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
              inputs: this.mapInputConnections(node.inputs),
              outputs: this.mapOutputConnections(node.outputs)
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

  private readonly mapInputConnections = (conns: WipStepListConnectionNode[]): BoxPort[] =>
    conns.map(i => ({
      key: i.key,
      label: this.invisibleIfOne && conns.length === 1 ? '' : i.label,
      multiple: true
    }));

  private readonly mapOutputConnections = (conns: WipStepListConnectionNode[]): BoxPort[] =>
    conns.map(o => ({
      key: o.key,
      label: this.invisibleIfOne && conns.length === 1 ? '' : o.label,
      multiple: false
    }));
}
