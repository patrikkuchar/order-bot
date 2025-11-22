import {computed, Injectable, Signal, signal} from '@angular/core';
import {UserInfo} from '../../api';
import {Observable, ReplaySubject} from 'rxjs';
import {map} from 'rxjs/operators';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private _user = signal<UserInfo | null>(null);
  user: Signal<UserInfo | null> = this._user.asReadonly();
  userName: Signal<string | null> = computed(() => {
    const user = this.user();
    if (!user || (!user.meno && !user.priezvisko)) {
      return null;
    }
    return `${user.meno} ${user.priezvisko}`;
  });

  constructor(authSvc: AuthService) {
    this.user = authSvc.userInfo;
  }

  private _onUserLoaded = new ReplaySubject<void>(1);
  onUserLoaded = this._onUserLoaded.asObservable();

  decidedForLoaded = (
    pred: (user: UserInfo | null) => boolean
  ): Observable<boolean> =>
    this.onUserLoaded.pipe(map(() => pred(this.user())));
}
