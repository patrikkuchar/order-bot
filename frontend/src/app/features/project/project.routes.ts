import {Routes} from '@angular/router';
import {NewProjectComponent} from './new/new-project.component';
import {OverviewComponent} from './overview/overview.component';
import {DesignerComponent} from './designer/designer.component';
import {SettingsComponent} from './settings/settings.component';
import {ProjectComponent} from './project.component';

let context: string[] = [];
const rootPath = 'project'
const path = `${rootPath}/:projectId`;

const newProject = {
  path: `${rootPath}/new`,
  to: () => [...context, rootPath, 'new'],
}

const overview = {
  path: `overview`,
  to: (projectId: string) => () => [...context, rootPath, projectId, 'overview'],
}

const designer = {
  path: `designer`,
  withNodeParam: `designer/:nodeId`,
  to: (projectId: string) => (nodeId?: string) => [
    ...context,
    rootPath,
    projectId,
    'designer',
    ...(nodeId ? [nodeId] : [])
  ],
}

const settings = {
  path: `settings`,
  to: (projectId: string) => () => [...context, rootPath, projectId, 'settings'],
}

export const ProjectRelativeRoutes = {
  overview: () => [`/${overview.path}`],
  designer: () => [`/${designer.path}`],
  settings: () => [`/${settings.path}`],
}

export const ProjectRoutes = {
  new: newProject.to,
  relative: ProjectRelativeRoutes,
  of: (projectId: string) => ({
    overview: overview.to(projectId),
    designer: designer.to(projectId),
    designerAndNode: (nodeId: string) => designer.to(projectId),
    settings: settings.to(projectId)
  })
}

export const ProjectRoutesContext = (ctx: string[]) => {
  context = ctx;
}

export const projectRouting: Routes = [
  {
    path: newProject.path,
    component: NewProjectComponent
  },
  {
    path,
    component: ProjectComponent,
    children: [
      { path: overview.path, component: OverviewComponent },
      { path: designer.withNodeParam, component: DesignerComponent },
      { path: designer.path, component: DesignerComponent },
      { path: settings.path, component: SettingsComponent },
      { path: '**', redirectTo: overview.path }
    ]
  }
];
