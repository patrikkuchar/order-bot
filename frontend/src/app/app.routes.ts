import { Routes } from '@angular/router';
import {HomeComponent} from './features/home/home.component';
import {ComponentShowsComponent} from './features/component-shows/component-shows.component';
import {RegisterComponent} from './features/register/register.component';
import {LoginComponent} from './features/login/login.component';
import {TestRoutes, TestRoutesContext, testRouting} from './features/test/test.routes';
import {BoxVisualizerDemoComponent} from './features/box-visualizer-demo/box-visualizer-demo.component';
import {ProjectRoutes, ProjectRoutesContext, projectRouting} from './features/project/project.routes';

const home = {
  path: '',
  to: () => ['/']
}

const components = {
  path: 'components',
  to: () => ['/components']
}

const login = {
  path: 'login',
  to: () => ['/login']
}

const register = {
  path: 'register',
  to: () => ['/register']
}

const boxVisualizerDemo = {
  path: 'box-visualizer-demo',
  to: () => ['/box-visualizer-demo']
}

const submodules = [TestRoutesContext, ProjectRoutesContext];
submodules.forEach((s) => s(['/']));

export const AppRoutes = {
  home: home.to,
  components: components.to,
  login: login.to,
  register: register.to,
  boxVisualizerDemo: boxVisualizerDemo.to,
  test: TestRoutes,
  project: ProjectRoutes
} as const;

export type RouteKeys = keyof typeof AppRoutes;

export const routes: Routes = [
  ...testRouting,
  ...projectRouting,
  {
    path: home.path,
    component: HomeComponent
  },
  {
    path: components.path,
    component: ComponentShowsComponent
  },
  {
    path: register.path,
    component: RegisterComponent
  },
  {
    path: login.path,
    component: LoginComponent
  },
  {
    path: boxVisualizerDemo.path,
    component: BoxVisualizerDemoComponent
  },
  { path: '**', redirectTo: '' } //or page not found
];
