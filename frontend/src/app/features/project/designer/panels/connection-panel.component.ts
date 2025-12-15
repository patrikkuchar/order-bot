import {Component} from '@angular/core';
import {Card} from 'primeng/card';
import {NgClass} from '@angular/common';
import {DesignerService} from '../designer.service';
import {RedirectService} from '../../../../core/services/redirect.service';
import {ProjectService} from '../../project.service';
import {ProjectRoutes} from '../../project.routes';
import {RouterLink} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

type Node = {
  id: string;
  label: string;
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
    :host {
      display: block;
      height: 100%;
      min-height: 0;
    }

    :host ::ng-deep .connection-card {
      background-color: var(--p-surface-menu);
      border-color: var(--p-surface-border, rgba(0, 0, 0, 0.08));
      color: var(--p-text-color);
      height: 100%;
      min-height: 0;
    }

    :host ::ng-deep .connection-card .p-card-body {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
    }

    :host ::ng-deep .connection-card .p-card-content {
      flex: 1 1 auto;
      min-height: 0;
    }

    .connections {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.25rem;
    }

    .connections-scroll {
      flex: 1 1 auto;
      min-height: 0;
      max-height: 100%;
      overflow-y: auto;
      padding-right: 0.35rem;
    }

    .connection-section {
      padding: 1rem;
      border: 1px solid var(--p-surface-border, rgba(0, 0, 0, 0.08));
      border-radius: 0.75rem;
      background: color-mix(in srgb, var(--p-surface-menu) 82%, transparent);
      box-shadow: 0 10px 30px -24px rgba(0, 0, 0, 0.35);
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }

    .section-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      border-radius: 0.65rem;
      color: var(--p-primary-color);
      background: color-mix(in srgb, var(--p-primary-color) 18%, transparent);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
      font-size: 1.1rem;
    }

    .section-text h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
    }

    .section-text p {
      margin: 0.1rem 0 0;
      color: var(--p-text-secondary-color, #6b7280);
      font-size: 0.85rem;
    }

    .connection-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .connection-item {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.45rem 0.5rem;
      border-radius: 0.65rem;
      transition: background-color 160ms ease, transform 160ms ease;
    }

    .connection-item:hover {
      background: color-mix(in srgb, var(--p-primary-color) 10%, transparent);
      transform: translateX(2px);
    }

    .connection-dot {
      width: 0.65rem;
      height: 0.65rem;
      border-radius: 50%;
      background: var(--p-primary-color);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--p-primary-color) 18%, transparent);
      flex-shrink: 0;
    }

    .connection-link {
      color: inherit;
      text-decoration: none;
      font-weight: 600;
      letter-spacing: 0.01em;
    }

    .connection-link:hover {
      text-decoration: underline;
    }

    .empty {
      margin: 0.3rem 0;
      color: var(--p-text-secondary-color, #6b7280);
      font-size: 0.9rem;
    }
  `],
  template: `
    <div class="h-full min-w-[25rem]">
      <p-card title="Connections" styleClass="connection-card" ngClass="h-full min-h-full">
        <div class="connections-scroll">
          <div class="connections">
            <div class="connection-section">
              <div class="section-header">
                <span class="section-icon pi pi-arrow-down-left" aria-hidden="true"></span>
                <div class="section-text">
                  <h3>Inputs</h3>
                <p>Nodes pointing to this step</p>
              </div>
            </div>
            @if (inputs.length > 0) {
              <ul class="connection-list">
                @for (input of inputs; track input.id) {
                  <li class="connection-item">
                    <span class="connection-dot" aria-hidden="true"></span>
                    <a class="connection-link" [routerLink]="input.link">{{ input.label }}</a>
                  </li>
                }
              </ul>
            } @else {
              <p class="empty">No incoming connections</p>
            }
          </div>

          <div class="connection-section">
            <div class="section-header">
              <span class="section-icon pi pi-arrow-up-right" aria-hidden="true"></span>
              <div class="section-text">
                <h3>Outputs</h3>
                <p>Nodes this step points to</p>
              </div>
              </div>
              @if (outputs.length > 0) {
                <ul class="connection-list">
                  @for (output of outputs; track output.id) {
                    <li class="connection-item">
                    <span class="connection-dot" aria-hidden="true"></span>
                    <a class="connection-link" [routerLink]="output.link">{{ output.label }}</a>
                  </li>
                }
              </ul>
            } @else {
              <p class="empty">No outgoing connections</p>
            }
          </div>
        </div>
        </div>
      </p-card>
    </div>
  `
})
export class ConnectionPanelComponent {
  inputs: Node[] = [];
  outputs: Node[] = [];

  constructor(projectSvc: ProjectService,
              svc: DesignerService,
              redirectSvc: RedirectService) {
    svc.step$
      .pipe(takeUntilDestroyed())
      .subscribe(data => {
        this.inputs = data.incomingConnections
          .map(i => ({
            id: i,
            label: `[${i}] ${svc.stepName(i)}`,
            link: redirectSvc.buildHref(
              ProjectRoutes.of(projectSvc.projectCode()!).designer, undefined, i
            )
          }));
        this.outputs = data.outgoingConnections
          .map(o => ({
            id: o,
            label: `[${o}] ${svc.stepName(o)}`,
            link: redirectSvc.buildHref(
              ProjectRoutes.of(projectSvc.projectCode()!).designer, undefined, o
            )
          }));
      });
  }
}
