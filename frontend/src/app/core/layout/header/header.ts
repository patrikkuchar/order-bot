import {Component, Signal} from '@angular/core';
import {DarkModeService} from '../../services/dark-mode.service';
import {AppRoutes} from '../../../app.routes';
import {AuthService} from '../../services/auth.service';
import {Observable} from 'rxjs';
import {UserProfileService} from '../../services/user-profile.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.scss',
  standalone: false
})
export class Header {

  isEnabled: Signal<boolean>;

  isLoggedIn: Observable<boolean>;
  userName: Signal<string | null>;

  constructor(private svc: DarkModeService,
              private authSvc: AuthService,
              userProfileSvc: UserProfileService) {
    this.isEnabled = this.svc.isDarkModeEnabled;
    this.isLoggedIn = authSvc.isLoggedIn;
    this.userName = userProfileSvc.userName;
  }

  toggleDarkMode() {
    this.svc.toggle();
  }

  logout() {
    this.authSvc.logout();
  }

  protected readonly AppRoutes = AppRoutes;
}
