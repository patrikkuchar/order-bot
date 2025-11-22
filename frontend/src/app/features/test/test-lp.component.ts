import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {Menubar} from 'primeng/menubar';
import {AppRoutes} from '../../app.routes';
import {InputNumber} from 'primeng/inputnumber';
import {FormsModule} from '@angular/forms';
import {MenuItem} from 'primeng/api';

@Component({
  imports: [
    RouterOutlet,
    Menubar,
    InputNumber,
    FormsModule
  ],
  template: `
    <h1>This is TEST component</h1>
    <p-inputNumber [(ngModel)]="detailValue" [min]="1" [max]="10" (ngModelChange)="setNavs()"></p-inputNumber>
    <p-menubar [model]="navs"></p-menubar>
    <router-outlet></router-outlet>
  `
})
export class TestLpComponent {
  detailValue = 1;

  navs = [] as MenuItem[];

  constructor() {
    this.setNavs();
  }

  setNavs(): void {
    this.navs = [
      {
        label: 'Form',
        icon: 'pi pi-fw pi-file',
        routerLink: AppRoutes.test.form()
      },
      {
        label: 'Detail',
        icon: 'pi pi-fw pi-user',
        routerLink: AppRoutes.test.detail(this.detailValue)
      },
      {
        label: 'List',
        icon: 'pi pi-fw pi-list',
        routerLink: AppRoutes.test.list()
      },
      {
        label: 'Grid',
        icon: 'pi pi-fw pi-th-large',
        routerLink: AppRoutes.test.grid()
      },
      {
        label: 'Table',
        icon: 'pi pi-fw pi-table',
        routerLink: AppRoutes.test.table()
      }
    ] as MenuItem[];
  }
}
