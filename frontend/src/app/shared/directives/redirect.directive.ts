import {Directive, inject, Input, OnChanges, SimpleChange, SimpleChanges} from '@angular/core';
import {RouterLink} from '@angular/router';
import {RedirectService} from '../../core/services/redirect.service';
import {RouteArgs, RoutePath} from '../../app/routes/types';

@Directive({
  selector: '[appRedirect]', // pouzitie: <button [appRedirect]="'/home'"></button>
  standalone: true,
  hostDirectives: [RouterLink]
})
export class RedirectDirective implements OnChanges {
  private redirect = inject(RedirectService);
  private routerLinkDirective = inject(RouterLink);

  @Input('appRedirect') routeArgs!: RouteArgs<RoutePath> | RoutePath;

  private lastValue?: string;

  ngOnChanges(_: SimpleChanges): void {
    this.setRouterLink();
  }

  private setRouterLink(): void {
    if (!this.routeArgs) {
      this.routerLinkDirective.routerLink = [];
      this.routerLinkDirective.ngOnChanges({
        routerLink: new SimpleChange(this.lastValue, [], this.lastValue === undefined)
      });
      this.lastValue = undefined;
      return;
    }

    const {pathFn, args} = this.normalizeRouteArgs(this.routeArgs);
    const href = this.redirect.buildHref(pathFn, undefined, ...(args as Parameters<typeof pathFn>));
    this.routerLinkDirective.routerLink = href;
    this.routerLinkDirective.ngOnChanges({
      routerLink: new SimpleChange(this.lastValue, href, this.lastValue === undefined)
    });
    this.lastValue = href;
  }

  private normalizeRouteArgs(route: RouteArgs<RoutePath> | RoutePath): { pathFn: RoutePath; args: unknown[] } {
    if (typeof route === 'function') {
      return { pathFn: route, args: [] };
    }

    return { pathFn: route.pathFn, args: route.args ?? [] };
  }
}
