import {Directive, HostListener, inject, Input} from '@angular/core';
import {RedirectService} from '../../core/services/redirect.service';
import {RouteArgs, RoutePath} from '../../app/routes/types';

@Directive({
  selector: '[appRedirect]', // pouzitie: <button [appRedirect]="'/home'"></button>
  standalone: true
})
export class RedirectDirective {
  private redirect = inject(RedirectService);

  @Input('appRedirect') routeArgs!: RouteArgs<RoutePath> | RoutePath;

  @HostListener('mouseenter', ['$event'])
  onMouseEnter(event: Event) {
    const el = event.currentTarget as HTMLElement | null;
    if (el) el.style.cursor = 'pointer';
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave(event: Event) {
    const el = event.currentTarget as HTMLElement | null;
    if (el) el.style.cursor = '';
  }

  @HostListener('click')
  onClick() {
    if (this.routeArgs) {
      if (typeof this.routeArgs === 'function') {
        this.redirect.to(this.routeArgs, undefined);
      } else {
        this.redirect.to(this.routeArgs.pathFn, undefined, ...(this.routeArgs.args ?? []));
      }
    }
  }
}
