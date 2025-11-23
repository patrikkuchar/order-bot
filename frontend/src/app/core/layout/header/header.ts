import {Component, computed, effect, Signal, signal} from '@angular/core';
import {DarkModeService} from '../../services/dark-mode.service';
import {AppRoutes} from '../../../app.routes';
import {AuthService} from '../../services/auth.service';
import {filter, map, Observable, startWith} from 'rxjs';
import {UserProfileService} from '../../services/user-profile.service';
import {RouteArgs, RoutePath} from '../../../app/routes/types';
import {ProjectService, ProjectShortInfo} from '../../../features/project/project.service';
import {ProjectRelativeRoutes, ProjectRoutes} from '../../../features/project/project.routes';
import {NavigationEnd, Router} from '@angular/router';
import {RedirectService} from '../../services/redirect.service';
import {toSignal} from '@angular/core/rxjs-interop';

export type MenuItem = {
  route: RouteArgs<RoutePath> | RoutePath
  routeVal: string
  label: string
  icon?: string
}

const overviewPath = ProjectRelativeRoutes.overview()[0];
const designerPath = ProjectRelativeRoutes.designer()[0];
const settingsPath = ProjectRelativeRoutes.settings()[0];

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.scss',
  standalone: false
})
export class Header {

  projects: Signal<ProjectShortInfo[]>;
  selectedProject: Signal<ProjectShortInfo | null>;

  menuItems = signal<MenuItem[]>([]);
  selectedMenuItem: Signal<MenuItem | undefined>;

  isEnabled: Signal<boolean>;

  isLoggedIn: Observable<boolean>;
  userName: Signal<string | null>;

  constructor(private svc: DarkModeService,
              private authSvc: AuthService,
              private redirectSvc: RedirectService,
              userProfileSvc: UserProfileService,
              projectSvc: ProjectService,
              router: Router) {
    this.isEnabled = this.svc.isDarkModeEnabled;
    this.isLoggedIn = authSvc.isLoggedIn;
    this.userName = userProfileSvc.userName;

    this.projects = projectSvc.projects;
    this.selectedProject = projectSvc.selectedProject;

    effect(() => {
      const sel = this.selectedProject();
      if (!sel) {
        this.menuItems.set([]);
        return;
      }
      const route = ProjectRoutes.of(sel.code);
      this.menuItems.set([
        {
          label: 'Overview',
          route: route.overview,
          routeVal: overviewPath,
          icon: 'pi pi-fw pi-home'
        },
        {
          label: 'Designer',
          route: route.designer,
          routeVal: designerPath,
          icon: 'pi pi-fw pi-pencil'
        },
        {
          label: 'Settings',
          route: route.settings,
          routeVal: settingsPath,
          icon: 'pi pi-fw pi-cog'
        }
      ]);
    }, { allowSignalWrites: true });

    const currentUrl = toSignal(
      router.events.pipe(
        filter(e => e instanceof NavigationEnd),
        map(e => (e as NavigationEnd).urlAfterRedirects),
        startWith(router.url)
      ),
      { initialValue: router.url }
    );

    this.selectedMenuItem = computed(() => {
      const url = currentUrl();
      return this.menuItems().find(item => url?.endsWith(item.routeVal));
    });
  }

  selectProject(project: ProjectShortInfo) {
    const route = ProjectRoutes.of(project.code);
    this.redirectSvc.to(route.overview);
  }

  toggleDarkMode() {
    this.svc.toggle();
  }

  logout() {
    this.authSvc.logout();
  }

  protected readonly AppRoutes = AppRoutes;
}
