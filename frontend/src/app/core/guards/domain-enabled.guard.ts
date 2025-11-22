import {inject} from '@angular/core';
import {CanMatchFn, Route, Router, UrlSegment, UrlTree} from '@angular/router';
import {ConfigurationResEnabledDomainsEnum} from '../../api';
import {ConfigurationService} from '../services/configuration.service';

export const domainEnabledGuard = (domain: ConfigurationResEnabledDomainsEnum): CanMatchFn => {
  return async (_route: Route, _segments: UrlSegment[]): Promise<boolean | UrlTree> => {
    const configSvc = inject(ConfigurationService);
    const router = inject(Router);

    await configSvc.afterConfigLoaded().catch(() => null);
    return configSvc.isDomainEnabled(domain) ? true : router.createUrlTree(['/']);
  };
};
