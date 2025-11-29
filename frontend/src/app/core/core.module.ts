import {NgModule} from '@angular/core';
import {Header} from './layout/header/header';
import {Button} from 'primeng/button';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {RedirectDirective} from '../shared/directives/redirect.directive';
import {ToggleSwitch} from 'primeng/toggleswitch';
import {FormsModule} from '@angular/forms';
import {AsyncPipe} from '@angular/common';
import {Divider} from "primeng/divider";
import {HeaderItemComponent} from './layout/header/header-item/header-item.component';
import {ProjectSelectComponent} from './layout/header/project-select/project-select.component';

@NgModule({
  imports: [
    Button,
    ProgressSpinnerModule,
    RedirectDirective,
    ToggleSwitch,
    FormsModule,
    AsyncPipe,
    Divider,
    HeaderItemComponent,
    ProjectSelectComponent
  ],
  declarations: [Header],
  exports: [
    Header,
    ProjectSelectComponent
  ]
})
export class CoreModule {}
