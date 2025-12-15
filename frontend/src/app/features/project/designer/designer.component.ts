import { Component, DestroyRef, effect, OnInit } from '@angular/core';
import {Card} from 'primeng/card';
import {ConnectionPanelComponent} from './panels/connection-panel.component';
import {ManagerPanelComponent} from './panels/manager-panel.component';
import {Button} from 'primeng/button';
import {
  BoxConnection,
  BoxNodePositionChange,
  BoxVisualizerComponent
} from '../../../shared/components/box-visualizer/box-visualizer.component';
import {DesignerService} from './designer.service';
import {BaseRouteDirective} from '../../../shared/directives/base-route.directive';
import {ProjectRoutes} from '../project.routes';
import {RedirectService} from '../../../core/services/redirect.service';
import {DesignerGraphService} from './designer-graph.service';
import {WipTemplateMngApi} from '../../../api';
import {ApiHandlingService} from '../../../core/services/api-handling.service';
import {ConfirmService} from '../../../core/services/confirm.service';
import {ToastService} from '../../../core/services/toast.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

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
    <div class="flex flex-col gap-4 h-full min-h-0 max-w-full w-full min-w-full">
      <p-card styleClass="designer-card" class="grow min-h-0">
        <div class="grow flex flex-row min-h-0 gap-4">
          <div class="flex flex-col gap-4 min-h-0">
            <p-button icon="pi pi-plus" [rounded]="true" (onClick)="createNode()"/>
            <p-button icon="pi pi-trash" [rounded]="true" severity="danger" [disabled]="!graphSvc.selectedNodeId()"
                      class="flex-auto" (onClick)="deleteNode()"/>
            <p-button icon="pi pi-refresh" [rounded]="true" severity="secondary" (onClick)="reloadClicked()"/>
            <p-button icon="pi pi-save" [rounded]="true" severity="primary" (onClick)="saveClicked()"/>
          </div>
          <div class="min-h-0 grow">
            <app-box-visualizer
              class="h-full block"
              [graph]="graphSvc.graph()"
              [selectedNodeId]="graphSvc.selectedNodeId()"
              (connectionCreated)="connectionCreated($event)"
              (connectionRemoved)="connectionRemoved($event)"
              (nodePositionChanged)="nodePositionChanged($event)"
              (selectedNodeIdChange)="onNodeSelected($event)"
            ></app-box-visualizer>
          </div>
        </div>
      </p-card>
      <div class="flex flex-row gap-4 w-full min-h-[20rem] max-w-full">
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
export class DesignerComponent extends BaseRouteDirective implements OnInit {
  private readonly projectId = this.param('projectId');
  private readonly routeNodeId = this.param('nodeId');

  private sessionId: string;

  onNodeSelected(nodeId: string | null): void {
    this.graphSvc.updateSelectedNode(nodeId);

    if (!nodeId) {
      this.navigateToNode(null);
      return;
    }

    this.navigateToNode(nodeId);
  }

  private navigateToNode(nodeId: string | null): void {
    const pid = this.projectId();
    if (!pid) {
      return;
    }
    this.redirectSvc.to(ProjectRoutes.of(pid).designer, undefined, nodeId ?? undefined);
  }

  constructor(protected svc: DesignerService,
              protected graphSvc: DesignerGraphService,
              private redirectSvc: RedirectService,
              private toastSvc: ToastService,
              private api: WipTemplateMngApi,
              private apiHandler: ApiHandlingService,
              private confirmSvc: ConfirmService,
              private destroyRef: DestroyRef) {
    super();
    effect(() => {
      if (svc.sessionId()) {
        this.sessionId = svc.sessionId()!;
      }
    })

    this.graphSvc.reset();

    effect(() => {
      const nodeId = this.routeNodeId();
      this.graphSvc.updateSelectedNode(nodeId);
    });
  }

  ngOnInit() {
    this.svc.steps$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(steps => this.graphSvc.updateGraph(steps));
  }

  createNode() {
    this.api.createStep(this.sessionId)
      .subscribe(this.apiHandler.handle({
        onSuccess: node => {
          this.graphSvc.addNode(node);
          this.navigateToNode(node.stepNumber);
        },
        silentSuccess: true
      }));
  }

  deleteNode() {
    const nodeId = this.graphSvc.selectedNodeId();
    if (!nodeId) {
      return;
    }

    const connToRemove = this.graphSvc.connectionsToRemoveForNode(nodeId);
    connToRemove.forEach(conn => this.api.deleteConnection(this.sessionId, conn).subscribe());

    this.api.deleteStep(this.sessionId, nodeId)
      .subscribe(this.apiHandler.handle({
        onSuccess: () => {
          this.graphSvc.removeNodeAndConn(nodeId);
          this.navigateToNode(null);
        },
        silentSuccess: true
      }));
  }

  reloadClicked(): void {
    if (!this.sessionId) {
      return;
    }

    this.api.isChanged(this.sessionId)
      .subscribe(isChanged => {
        if (!isChanged.value) {
          this.toastSvc.info('Template have no changes');
          return;
        }
        this.confirmSvc.confirm({
          message: 'Naozaj chcete odstrániť všetky zmeny?',
          tone: 'danger',
          accept: () => this.clearSession()
        });
      });
  }

  saveClicked(): void {
    if (!this.sessionId) {
      return;
    }

    this.api.isChanged(this.sessionId)
      .subscribe(isChanged => {
        if (!isChanged.value) {
          this.toastSvc.info('Template have no changes');
        } else {
          this.validateAndSave();
        }
      })
  }

  nodePositionChanged(change: BoxNodePositionChange) {
    this.api.updateStepLocation(this.sessionId, change.nodeId, {
      position: {
        x: change.position.x,
        y: change.position.y
      }
    }).subscribe(this.apiHandler.handle({
      onSuccess: () => this.graphSvc.updateLocation(change),
      silentSuccess: true
    }));
  }

  connectionCreated(connection: BoxConnection) {
    this.api.createConnection(this.sessionId, {
      sourceStepNumber: connection.source,
      targetStepNumber: connection.target,
      sourceOutput: connection.sourceOutput,
      targetInput: connection.targetInput
    }).subscribe(this.apiHandler.handle({
      onSuccess: res => this.graphSvc.createConnection(connection, res.value),
      silentSuccess: true
    }));
  }

  connectionRemoved(connection: BoxConnection) {
    this.api.deleteConnection(this.sessionId, connection.id)
      .subscribe(this.apiHandler.handle({
        onSuccess: () => this.graphSvc.removeConnection(connection.id),
        silentSuccess: true
      }));
  }

  private validateAndSave() {
    this.api.validateSteps(this.sessionId)
      .subscribe(this.apiHandler.handle({
        onSuccess: (res) => {
          if (res.isValid) {
            this.saveSession();
            return;
          }
          this.toastSvc.warn(res.errorMessage!, res.errorType);
        },
        silentSuccess: true
      }))
  }

  private saveSession() {
    this.api.completeTemplate(this.sessionId)
      .subscribe(this.apiHandler.handle({
        onSuccess: () => this.svc.reloadSession(),
        successMsg: 'Template saved',
      }));
  }

  private clearSession() {
    this.api.clearSession(this.sessionId)
      .subscribe(this.apiHandler.handle({
        onSuccess: () => this.svc.reloadSession(),
        successMsg: 'All changes cleared.',
        redirect: () => ProjectRoutes.of(this.projectId()!).designer
      }));
  }
}
