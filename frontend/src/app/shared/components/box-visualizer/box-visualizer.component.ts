import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  Injector
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  AngularPlugin,
  AngularArea2D,
  Presets as AngularPresets,
  ReteModule
} from 'rete-angular-plugin/20';

import { NodeEditor, ClassicPreset, GetSchemes } from 'rete';
import { AreaPlugin, AreaExtensions } from 'rete-area-plugin';
import { ConnectionPlugin, Presets as ConnectionPresets } from 'rete-connection-plugin';

/* -------------------------------------------------------------------------------------
 * TYPE DEFINITIONS
 * ------------------------------------------------------------------------------------ */

type NodeData = ClassicPreset.Node;
type ConnectionData = ClassicPreset.Connection<ClassicPreset.Node, ClassicPreset.Node> & { isLoop?: boolean };
type Schemes = GetSchemes<NodeData, ConnectionData>;
type AreaExtra = AngularArea2D<Schemes>;
type Position = { x: number; y: number };

export interface BoxPort {
  key: string;
  label?: string;
  multiple?: boolean;
}

export interface BoxNodeDefinition {
  id: string;
  label: string;
  position?: Position;
  inputs?: BoxPort[];
  outputs?: BoxPort[];
}

export interface BoxConnection {
  id?: string;
  source: string;
  target: string;
  sourceOutput: string;
  targetInput: string;
}

export interface BoxGraph {
  nodes: BoxNodeDefinition[];
  connections: BoxConnection[];
}

/* -------------------------------------------------------------------------------------
 * COMPONENT
 * ------------------------------------------------------------------------------------ */

@Component({
  selector: 'app-box-visualizer',
  standalone: true,
  imports: [CommonModule, ReteModule],
  template: `
    <div #container class="rete-container"></div>
  `,
  styles: [`
    .rete-container {
      position: relative;
      width: 100%;
      min-height: 400px;
      border: 1px solid #dcdcdc;
      border-radius: 10px;
      background: #f5f6fa;
      overflow: hidden;
    }

    .rete-container .selected-node {
      outline: 2px solid #0d6efd;
      box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.2);
      border-radius: 8px;
      background: #f6ff99;
    }
  `]
})
export class BoxVisualizerComponent implements AfterViewInit, OnChanges, OnDestroy {

  constructor(private injector: Injector) {}

  @Input() graph: BoxGraph | null = null;
  @Output() graphChange = new EventEmitter<BoxGraph>();
  @Input() selectedNodeId: string | null = null;
  @Output() selectedNodeIdChange = new EventEmitter<string | null>();

  @ViewChild('container', { static: true })
  container!: ElementRef<HTMLDivElement>;

  private editor!: NodeEditor<Schemes>;
  private area!: AreaPlugin<Schemes, AreaExtra>;
  private angularRenderer!: AngularPlugin<Schemes, AreaExtra>;
  private connectionPlugin!: ConnectionPlugin<Schemes, AreaExtra>;

  private socket = new ClassicPreset.Socket('socket');
  private syncing = false;
  private currentSelectedNodeId: string | null = null;
  private nodeClickHandlers = new Map<string, { element: HTMLElement; down: (e: PointerEvent) => void; up: (e: PointerEvent) => void }>();
  private nodePointerStart = new Map<string, { x: number; y: number }>();

  /** Last graph to avoid infinite loop */
  private lastAppliedGraphJson = '';

  /* -----------------------------------------------------------------------------------
   * LIFECYCLE
   * ---------------------------------------------------------------------------------- */

  async ngAfterViewInit(): Promise<void> {
    await this.setupEditor();
    if (this.graph) {
      await this.applyGraph(this.graph);
    }
    this.setSelectedNode(this.selectedNodeId, false);
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (!this.editor) return;

    if (changes['graph']) {
      const newGraphJson = JSON.stringify(changes['graph'].currentValue);

      if (newGraphJson === this.lastAppliedGraphJson) {
        return; // no-op, prevents infinite loop
      }

      await this.applyGraph(changes['graph'].currentValue);
    }

    if (changes['selectedNodeId']) {
      this.setSelectedNode(changes['selectedNodeId'].currentValue ?? null, false);
    }
  }

  ngOnDestroy(): void {
    this.detachNodeClickListeners();
    this.area?.destroy();
  }

  /* -----------------------------------------------------------------------------------
   * EDITOR INIT
   * ---------------------------------------------------------------------------------- */

  private async setupEditor(): Promise<void> {
    const el = this.container.nativeElement;

    this.editor = new NodeEditor<Schemes>();
    this.area = new AreaPlugin<Schemes, AreaExtra>(el);
    this.connectionPlugin = new ConnectionPlugin<Schemes, AreaExtra>();

    this.angularRenderer = new AngularPlugin<Schemes, AreaExtra>({
      injector: this.injector
    });

    this.angularRenderer.addPreset(AngularPresets.classic.setup());
    this.connectionPlugin.addPreset(ConnectionPresets.classic.setup());
    AreaExtensions.simpleNodesOrder(this.area);

    this.editor.use(this.area);
    this.area.use(this.connectionPlugin);
    this.area.use(this.angularRenderer);

    this.registerListeners();
  }

  /* -----------------------------------------------------------------------------------
   * EVENT HANDLERS
   * ---------------------------------------------------------------------------------- */

  private registerListeners(): void {
    this.editor.addPipe(ctx => {
      if (
        ctx.type === 'connectioncreated' ||
        ctx.type === 'connectionremoved' ||
        ctx.type === 'noderemoved'
      ) {
        this.emitGraph();
      }
      return ctx;
    });

    this.area.addPipe(ctx => {
      if (ctx.type === 'nodetranslated') {
        this.emitGraph();
      }
      return ctx;
    });
  }

  /* -----------------------------------------------------------------------------------
   * APPLY GRAPH
   * ---------------------------------------------------------------------------------- */

  private async applyGraph(graph: BoxGraph): Promise<void> {
    this.syncing = true;
    this.detachNodeClickListeners();

    await this.editor.clear();

    const registry = new Map<string, ClassicPreset.Node>();

    // 1) Add nodes
    for (const def of graph.nodes ?? []) {
      const node = this.buildNode(def);
      await this.editor.addNode(node);
      registry.set(def.id, node);

      const pos = def.position ?? { x: 50, y: 50 };
      await this.area.translate(def.id, pos);
    }

    // 2) Add connections
    for (const c of graph.connections ?? []) {
      const source = registry.get(c.source);
      const target = registry.get(c.target);
      if (!source || !target) continue;

      if (!source.outputs[c.sourceOutput]) continue;
      if (!target.inputs[c.targetInput]) continue;

      const conn = new ClassicPreset.Connection(
        source,
        c.sourceOutput as any,
        target,
        c.targetInput as any
      );
      if (c.id) conn.id = c.id;

      await this.editor.addConnection(conn);
    }

    this.syncing = false;

    /** Update last-applied snapshot */
    this.lastAppliedGraphJson = JSON.stringify(graph);

    this.emitGraph();
    this.hightlightNodeToggle(this.currentSelectedNodeId, true);
    this.attachNodeClickListeners();
  }

  /* -----------------------------------------------------------------------------------
   * HELPERS
   * ---------------------------------------------------------------------------------- */

  private buildNode(def: BoxNodeDefinition): ClassicPreset.Node {
    const node = new ClassicPreset.Node(def.label);
    node.id = def.id;

    def.inputs?.forEach((port, i) => {
      const inp = new ClassicPreset.Input(
        this.socket,
        port.label ?? port.key,
        port.multiple ?? false
      );
      inp.index = i;
      node.addInput(port.key, inp);
    });

    def.outputs?.forEach((port, i) => {
      const out = new ClassicPreset.Output(
        this.socket,
        port.label ?? port.key,
        port.multiple ?? true
      );
      out.index = i;
      node.addOutput(port.key, out);
    });

    return node;
  }

  private emitGraph(): void {
    if (this.syncing) return;

    const nodes = this.editor.getNodes().map(n => ({
      id: n.id,
      label: n.label,
      position: this.area.nodeViews.get(n.id)?.position ?? { x: 0, y: 0 },

      inputs: Object.entries(n.inputs).map(([k, p]) => ({
        key: k,
        label: p!.label,
        multiple: p!.multipleConnections
      })),

      outputs: Object.entries(n.outputs).map(([k, p]) => ({
        key: k,
        label: p!.label,
        multiple: p!.multipleConnections
      }))
    }));

    const connections = this.editor.getConnections().map(c => ({
      id: c.id,
      source: c.source,
      target: c.target,
      sourceOutput: c.sourceOutput as string,
      targetInput: c.targetInput as string
    }));

    const graph: BoxGraph = { nodes, connections };
    const json = JSON.stringify(graph);

    if (json === this.lastAppliedGraphJson) {
      return; // prevent loops
    }

    this.lastAppliedGraphJson = json;
    this.graphChange.emit(graph);
  }

  private setSelectedNode(nodeId: string | null, emit = true): void {
    if (this.currentSelectedNodeId === nodeId) return;

    this.hightlightNodeToggle(this.currentSelectedNodeId, false);
    this.hightlightNodeToggle(nodeId, true);
    this.currentSelectedNodeId = nodeId;

    if (emit) {
      this.selectedNodeIdChange.emit(nodeId);
    }
  }

  private hightlightNodeToggle(nodeId: string | null, highlight: boolean): void {
    if (!nodeId) return;
    const node = this.editor.getNode(nodeId);
    if (!node) return;
    node.selected = highlight;
  }

  private attachNodeClickListeners(): void {
    if (!this.area) return;

    this.area.nodeViews.forEach((view, id) => {
      if (this.nodeClickHandlers.has(id)) return;

      const onDown = (event: PointerEvent) => {
        this.nodePointerStart.set(id, { x: event.clientX, y: event.clientY });
      };

      const onUp = (event: PointerEvent) => {
        const start = this.nodePointerStart.get(id);
        this.nodePointerStart.delete(id);
        if (!start) return;

        const dx = Math.abs(event.clientX - start.x);
        const dy = Math.abs(event.clientY - start.y);
        if (dx + dy > 5) return; // treat as drag, not click

        this.setSelectedNode(id);
      };

      view.element.addEventListener('pointerdown', onDown);
      view.element.addEventListener('pointerup', onUp);

      this.nodeClickHandlers.set(id, { element: view.element, down: onDown, up: onUp });
    });
  }

  private detachNodeClickListeners(): void {
    this.nodeClickHandlers.forEach(({ element, down, up }) => {
      element.removeEventListener('pointerdown', down);
      element.removeEventListener('pointerup', up);
    });
    this.nodeClickHandlers.clear();
    this.nodePointerStart.clear();
  }
}
