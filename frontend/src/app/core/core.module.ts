import {NgModule} from '@angular/core';
import {Header} from './layout/header/header';
import {Button} from 'primeng/button';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {RedirectDirective} from '../shared/directives/redirect.directive';
import {ToggleSwitch} from 'primeng/toggleswitch';
import {FormsModule} from '@angular/forms';
import {AsyncPipe} from '@angular/common';

@NgModule({
  imports: [
    Button,
    ProgressSpinnerModule,
    RedirectDirective,
    ToggleSwitch,
    FormsModule,
    AsyncPipe
  ],
  declarations: [Header],
  exports: [
    Header
  ]
})
export class CoreModule {}
