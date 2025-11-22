import {computed, Injectable, Signal, signal} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs';
import {AuthApi, LoginReq, LoginRes, UserInfo, UserRole} from '../../api';
import {MyStorage} from '../../shared/persistance/MyStorage';
import { JwtPayload, jwtDecode } from 'jwt-decode';
import {map} from 'rxjs/operators';
import {AppRoutes} from '../../app.routes';
import {RedirectService} from './redirect.service';
import {ConfigurationService} from './configuration.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isLoggedIn = new ReplaySubject<boolean>(1);

  isLoggedIn = this._isLoggedIn.asObservable();

  private session = signal<LoginRes | null>(null);

  private storage = new MyStorage<LoginRes>('userDataKey', localStorage);

  isAdmin = computed(() =>
    [UserRole.ADMIN].includes(this.role() ?? undefined as never)
  );

  role: Signal<UserRole | null> = computed(
    () => this.session()?.userInfo.role ?? null
  );

  userInfo: Signal<UserInfo | null> = computed(
    () => this.session()?.userInfo ?? null
  );

  constructor(private authApi: AuthApi,
              private redirect: RedirectService,
              configSvc: ConfigurationService) {
    this.isLoggedIn.pipe(takeUntilDestroyed()).subscribe(() => configSvc.reload());
  }

  restoreSession(): void {
    const persistedSession = this.storage.get();
    if (!persistedSession) {
      this._isLoggedIn.next(false);
      return;
    }

    if (this.isTokenExpired(persistedSession.token)) {
      this.storage.clear();
      this._isLoggedIn.next(false);
      return;
    }
    this.processLoginRes(persistedSession);
    this._isLoggedIn.next(true);
  }

  private isTokenExpired(token: string) {
    const decodedToken: JwtPayload = jwtDecode(token);
    if (!decodedToken?.exp) {
      return true;
    }
    return decodedToken && Date.now() >= decodedToken.exp * 1000;
  }

  login = (req: LoginReq): Observable<void> =>
    this.authApi.login(req).pipe(
      map((res) => {
        console.log(JSON.stringify(res))
        this.storage.save(res);
        this.processLoginRes(res);
        this._isLoggedIn.next(true);
      })
    );

  logout(): void {
    this.storage.clear();
    this.session.set(null);
    this._isLoggedIn.next(false);
    this.redirect.to(AppRoutes.login)
  }

  private processLoginRes(res: LoginRes) {
    this.session.set(res);
  }

  getAuthToken(): string | null {
    return this.session()?.token ?? null;
  }
}
