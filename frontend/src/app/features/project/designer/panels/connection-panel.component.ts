import {Component, effect} from '@angular/core';
import {Card} from 'primeng/card';
import {NgClass} from '@angular/common';
import {WipTemplateMngApi} from '../../../../api';
import {DesignerGraphService} from '../designer-graph.service';
import {DesignerService} from '../designer.service';
import {RedirectService} from '../../../../core/services/redirect.service';
import {ProjectService} from '../../project.service';
import {ProjectRoutes} from '../../project.routes';
import {RouterLink} from '@angular/router';

type Node = {
  id: string;
  link: string
}

@Component({
  selector: 'app-connection-panel',
  imports: [
    Card,
    NgClass,
    RouterLink
  ],
  styles: [`
    :host ::ng-deep .connection-card {
      background-color: var(--p-surface-menu);
      border-color: var(--p-surface-border, rgba(0, 0, 0, 0.08));
      color: var(--p-text-color);
    }
  `],
  template: `
    <div class="h-full min-w-[25rem]">
      <p-card title="Connections" styleClass="connection-card" ngClass="h-full min-h-full">
        <h2>Connections</h2>
        @if (inputs.length > 0) {
          <h3>Inputs</h3>
          <ol>
            @for (input of inputs; track input.id) {
              <li><a [routerLink]="input.link">{{input.id}}</a></li>
            }
          </ol>
        }
        @if (outputs.length > 0) {
          <h3>Outputs</h3>
          <ol>
            @for (output of outputs; track output) {
              <li><a [routerLink]="output.link">{{output.id}}</a></li>
            }
          </ol>
        }
      </p-card>
    </div>
  `
})
export class ConnectionPanelComponent {
  inputs: Node[] = [];
  outputs: Node[] = [];

  constructor(graphSvc: DesignerGraphService,
              projectSvc: ProjectService,
              svc: DesignerService,
              api: WipTemplateMngApi,
              redirectSvc: RedirectService) {
    effect(() => {
      if (graphSvc.selectedNodeId() && svc.sessionId() && projectSvc.projectCode()) {
        api.getStep(svc.sessionId()!, graphSvc.selectedNodeId()!)
          .subscribe(data => {
            this.inputs = data.incomingConnections
              .map(i => ({
                id: i,
                link: redirectSvc.buildHref(
                  ProjectRoutes.of(projectSvc.projectCode()!).designer, undefined, i
                )
              }));
            this.outputs = data.outgoingConnections
              .map(o => ({
                id: o,
                link: redirectSvc.buildHref(
                  ProjectRoutes.of(projectSvc.projectCode()!).designer, undefined, o
                )
              }));
          }
        );
      }
    });
  }
}
