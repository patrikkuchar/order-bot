import {Routes} from '@angular/router';
import {TestComponent} from './test.component';
import {TestLpComponent} from './test-lp.component';
import {TestDetailComponent} from './test-detail.component';
import {TestListComponent} from './test-list.component';
import {TestTableComponent} from './test-table.component';
import {TestGridComponent} from './test-grid.component';
import {domainEnabledGuard} from '../../core/guards/domain-enabled.guard';
import {ConfigurationResEnabledDomainsEnum} from '../../api';

let context: string[] = [];
const path = 'test';

const root = {
  path,
  to: () => [...context, path]
}

const form = {
  path: 'form',
  to: () => [...context, path, 'form']
}

const detail = {
  path: 'detail/:id',
  to: (id: number) => [...context, path, 'detail', id.toString()] as string[]
}

const list = {
  path: 'list',
  to: () => [...context, path, 'list']
}

const grid = {
  path: 'grid',
  to: () => [...context, path, 'grid']
}

const table = {
  path: 'table',
  to: () => [...context, path, 'table']
}

export const TestRoutes = {
  root: root.to,
  form: form.to,
  detail: detail.to,
  list: list.to,
  grid: grid.to,
  table: table.to
}

export const TestRoutesContext = (ctx: string[]) => {
  context = ctx;
}

export const testRouting: Routes = [
  {
    path,
    canMatch: [domainEnabledGuard(ConfigurationResEnabledDomainsEnum.TEST)],
    component: TestLpComponent,
    children: [
      { path: form.path, component: TestComponent },
      { path: detail.path, component: TestDetailComponent },
      { path: list.path, component: TestListComponent },
      { path: grid.path, component: TestGridComponent },
      { path: table.path, component: TestTableComponent }
    ]
  }
];
