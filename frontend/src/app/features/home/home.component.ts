import {Component, Signal} from '@angular/core';
import {RedirectDirective} from '../../shared/directives/redirect.directive';
import {AppRoutes} from '../../app.routes';
import {ConfigurationService} from '../../core/services/configuration.service';
import {ConfigurationResEnabledDomainsEnum} from '../../api';

@Component({
  imports: [
    RedirectDirective
  ],
  template: `
    <div class="flex flex-col gap-4 ml-6">
      <a [appRedirect]="AppRoutes.components">Link to components</a>
      <a [appRedirect]="AppRoutes.login">Link to login</a>
      <a [appRedirect]="AppRoutes.register">Link to register</a>
      <a [appRedirect]="AppRoutes.boxVisualizerDemo">Link to box visualizer demo</a>
      @if (testEnabled()) {
        <a [appRedirect]="AppRoutes.test.root">Link to tests</a>
      }
    </div>

  `
})
export class HomeComponent {

  testEnabled: Signal<boolean>;

  constructor(configSvc: ConfigurationService) {
    this.testEnabled = configSvc.isEnabledDomain(ConfigurationResEnabledDomainsEnum.TEST);
  }

  protected readonly AppRoutes = AppRoutes;
}
