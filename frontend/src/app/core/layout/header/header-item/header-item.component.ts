import {Component, Input} from '@angular/core';
import {RouteArgs, RoutePath} from '../../../../app/routes/types';
import {RedirectDirective} from '../../../../shared/directives/redirect.directive';

@Component({
  selector: 'app-header-item',
  standalone: true,
  template: `
    <a
      class="header-item"
      [class.header-item--selected]="selected"
      [appRedirect]="route!"
      [attr.aria-current]="selected ? 'page' : null"
    >
      @if (icon) {
        <span class="header-item__icon" [class]="icon" aria-hidden="true"></span>
      }
      <span class="header-item__label">{{ label }}</span>
    </a>
  `,
  imports: [
    RedirectDirective
  ],
  styles: `
    :host {
      display: inline-flex;
    }

    .header-item {
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

    .header-item:hover,
    .header-item:focus-visible {
      color: var(--p-primary-color);
      background: color-mix(in srgb, var(--p-primary-color) 12%, transparent);
      box-shadow: 0 10px 30px -20px rgba(0, 0, 0, 0.35);
      transform: translateY(-1px);
      outline: none;
    }

    .header-item--selected {
      color: var(--p-primary-color);
      background: color-mix(in srgb, var(--p-primary-color) 18%, transparent);
      box-shadow: 0 12px 30px -18px color-mix(in srgb, var(--p-primary-color) 40%, transparent);
      border-color: color-mix(in srgb, var(--p-primary-color) 40%, transparent);
      border-bottom-color: var(--p-primary-color);
    }

    .header-item__label {
      white-space: nowrap;
    }

    .header-item__icon {
      font-size: 0.95rem;
      color: inherit;
      opacity: 0.95;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.25rem;
    }
  `
})
export class HeaderItemComponent {

  @Input() label = '';
  @Input() selected = false;
  @Input() route: RouteArgs<RoutePath> | RoutePath;
  @Input() icon?: string;
}
