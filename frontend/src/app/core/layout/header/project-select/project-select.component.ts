import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Popover} from 'primeng/popover';
import {ProjectShortInfo} from '../../../../features/project/project.service';

@Component({
  selector: 'app-project-select',
  standalone: true,
  imports: [Popover],
  template: `
    <p-popover
      #popover
      appendTo="body"
      styleClass="project-select__panel"
      [dismissable]="true"
      [autoZIndex]="true"
      (onShow)="popoverOpen = true"
      (onHide)="popoverOpen = false"
    >
      <div class="project-select__popover">
        @if (projects.length) {
          @for (project of projects; track project.id) {
            <button
              type="button"
              class="project-select__option"
              [class.project-select__option--active]="project === selectedProject"
              (click)="selectProject(project, popover)"
            >
              <div class="project-select__option-body">
                <div class="project-select__option-title">{{ project.name }}</div>
              </div>
            </button>
          }
        } @else {
          <div class="project-select__empty">Žiadne projekty na výber</div>
        }
        <button
          type="button"
          class="project-select__add"
          (click)="handleAddProject(popover)"
        >
          <i class="pi pi-plus" aria-hidden="true"></i>
          <span>Pridať projekt</span>
        </button>
      </div>
    </p-popover>

    <a
      class="project-select__trigger"
      [class.project-select__trigger--active]="popoverOpen || !!selectedProject"
      href="#"
      role="button"
      (click)="toggle(popover, $event)"
      (keydown.enter)="toggle(popover, $event)"
      (keydown.space)="toggle(popover, $event)"
      [attr.aria-expanded]="popoverOpen"
      [attr.aria-haspopup]="'listbox'"
    >
      <div class="project-select__text">
        <span class="project-select__label">{{ selectedProject?.name || placeholder }}</span>
      </div>
      <i class="pi" [class.pi-chevron-up]="popoverOpen" [class.pi-chevron-down]="!popoverOpen" aria-hidden="true"></i>
    </a>
  `,
  styles: `
    :host {
      display: inline-flex;
    }

    .project-select__trigger {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.55rem 0.9rem 0.35rem;
      border-radius: 999px;
      color: var(--p-text-color);
      text-decoration: none;
      font-weight: 600;
      letter-spacing: 0.01em;
      border: 1px solid transparent;
      border-bottom: 3px solid transparent;
      transition: color 180ms ease, box-shadow 180ms ease, background-color 180ms ease, transform 180ms ease, border-color 180ms ease;
    }

    .project-select__trigger:hover,
    .project-select__trigger:focus-visible {
      color: var(--p-primary-color);
      background: color-mix(in srgb, var(--p-primary-color) 12%, transparent);
      box-shadow: 0 10px 30px -20px rgba(0, 0, 0, 0.35);
      transform: translateY(-1px);
      outline: none;
    }

    .project-select__trigger--active {
      color: var(--p-primary-color);
      background: color-mix(in srgb, var(--p-primary-color) 18%, transparent);
      box-shadow: 0 12px 30px -18px color-mix(in srgb, var(--p-primary-color) 40%, transparent);
      border-color: color-mix(in srgb, var(--p-primary-color) 40%, transparent);
      border-bottom-color: var(--p-primary-color);
    }

    .project-select__icon {
      width: 1.5rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 1.05rem;
      color: inherit;
      opacity: 0.95;
    }

    .project-select__text {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      min-width: 0;
    }

    .project-select__label {
      white-space: nowrap;
    }

    .project-select__sublabel {
      font-size: 0.78rem;
      color: var(--p-text-secondary-color);
      white-space: nowrap;
    }

    .project-select__popover {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0.35rem;
      min-width: 240px;
    }

    .project-select__option {
      width: 100%;
      border: 1px solid var(--p-surface-border);
      border-radius: 12px;
      background: var(--p-surface-card);
      padding: 0.65rem 0.75rem;
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 0.5rem;
      align-items: center;
      text-align: left;
      cursor: pointer;
      transition: border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease, background-color 150ms ease;
      color: var(--p-text-color);
    }

    .project-select__option:hover {
      border-color: color-mix(in srgb, var(--p-primary-color) 40%, transparent);
      box-shadow: 0 10px 30px -20px rgba(0, 0, 0, 0.35);
      transform: translateY(-1px);
      background: color-mix(in srgb, var(--p-primary-color) 10%, var(--p-surface-card));
    }

    .project-select__option--active {
      border-color: color-mix(in srgb, var(--p-primary-color) 60%, transparent);
      background: color-mix(in srgb, var(--p-primary-color) 16%, var(--p-surface-card));
      box-shadow: 0 12px 30px -18px color-mix(in srgb, var(--p-primary-color) 40%, transparent);
    }

    .project-select__option-icon {
      width: 2rem;
      height: 2rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      background: color-mix(in srgb, currentColor 18%, transparent);
      color: var(--p-primary-color);
      font-size: 1rem;
    }

    .project-select__option-body {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      min-width: 0;
    }

    .project-select__option-title {
      font-weight: 600;
      color: var(--p-text-color);
      white-space: nowrap;
    }

    .project-select__option-desc {
      font-size: 0.82rem;
      color: var(--p-text-secondary-color);
      white-space: nowrap;
    }

    .project-select__check {
      color: var(--p-primary-color);
      font-size: 1rem;
    }

    .project-select__add {
      margin-top: 0.35rem;
      width: 100%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      padding: 0.65rem 0.75rem;
      border-radius: 12px;
      border: 1px solid color-mix(in srgb, var(--p-primary-color) 50%, transparent);
      background: color-mix(in srgb, var(--p-primary-color) 10%, var(--p-surface-card));
      color: var(--p-primary-color);
      font-weight: 600;
      cursor: pointer;
      transition: transform 120ms ease, box-shadow 120ms ease, background-color 120ms ease, border-color 120ms ease;
    }

    .project-select__add:hover,
    .project-select__add:focus-visible {
      background: color-mix(in srgb, var(--p-primary-color) 16%, var(--p-surface-card));
      box-shadow: 0 12px 30px -18px color-mix(in srgb, var(--p-primary-color) 40%, transparent);
      transform: translateY(-1px);
      outline: none;
    }

    .project-select__empty {
      padding: 0.5rem 0.75rem;
      color: var(--p-text-secondary-color);
      text-align: center;
    }

    :host ::ng-deep .project-select__panel {
      border-radius: 14px;
      border: 1px solid var(--p-surface-border);
      box-shadow: 0 20px 50px -28px rgba(0, 0, 0, 0.5);
      background: var(--p-surface-card);
    }
  `
})
export class ProjectSelectComponent {

  @Input() projects: ProjectShortInfo[] = [];
  @Input() selectedProject: ProjectShortInfo | null = null;
  @Output() projectSelected = new EventEmitter<ProjectShortInfo>();
  @Output() addProject = new EventEmitter<void>();
  @Input() placeholder = 'Vyber projekt';

  popoverOpen = false;

  toggle(popover: Popover, event: Event): void {
    event.preventDefault();
    popover.toggle(event);
  }

  selectProject(project: ProjectShortInfo, popover: Popover): void {
    this.selectedProject = project;
    this.projectSelected.emit(project);
    popover.hide();
  }

  handleAddProject(popover: Popover): void {
    this.addProject.emit();
    popover.hide();
  }
}
