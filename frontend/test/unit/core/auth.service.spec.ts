import { beforeEach, describe, expect, test, vi } from 'vitest';
import { firstValueFrom, Observable, take } from 'rxjs';
import type { AuthApi } from '@src/app/api/api/api';
import type { LoginRes } from '@src/app/api/model/loginRes';
import type { UserInfo } from '@src/app/api/model/userInfo';
import { UserRole } from '@src/app/api/model/userRole';
import type { ConfigurationService } from '@src/app/core/services/configuration.service';
import { AuthService } from '@src/app/core/services/auth.service';
import { RedirectService } from '@src/app/core/services/redirect.service';
import { MyStorage } from '@src/app/shared/persistance/MyStorage';

vi.mock('@angular/core/rxjs-interop', () => ({
  takeUntilDestroyed: () => <T>(source: Observable<T>) => source
}));

interface StorageStub extends Pick<MyStorage<LoginRes>, 'get' | 'clear' | 'save'> {}

const defaultUserInfo: UserInfo = {
  email: 'demo@email.com',
  meno: 'Demo',
  priezvisko: 'User',
  role: UserRole.USER
};

function futureExp(secondsFromNow: number): number {
  return Math.floor(Date.now() / 1000) + secondsFromNow;
}

function createToken(expiration: number): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ exp: expiration })).toString('base64url');
  return `${header}.${payload}.signature`;
}

function createService(storageValue: LoginRes | null) {
  const authApi = {
    login: vi.fn()
  } as unknown as AuthApi;

  const redirect = {
    to: vi.fn()
  } as unknown as RedirectService;

  const configSvc = {
    reload: vi.fn()
  } as unknown as ConfigurationService;

  const service = new AuthService(authApi, redirect, configSvc);
  const storage: StorageStub = {
    get: vi.fn().mockReturnValue(storageValue),
    clear: vi.fn(),
    save: vi.fn()
  };

  (service as unknown as { storage: StorageStub }).storage = storage;

  return { service, storage };
}

describe('AuthService restoreSession', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  test('emits false when there is no persisted session', async () => {
    const { service } = createService(null);

    const emission = firstValueFrom(service.isLoggedIn.pipe(take(1)));
    service.restoreSession();

    expect(await emission).toBe(false);
    expect(service.getAuthToken()).toBeNull();
  });

  test('clears storage and emits false when the token is expired', async () => {
    const expiredSession: LoginRes = {
      token: createToken(futureExp(-60)),
      userInfo: defaultUserInfo
    };
    const { service, storage } = createService(expiredSession);

    const emission = firstValueFrom(service.isLoggedIn.pipe(take(1)));
    service.restoreSession();

    expect(storage.clear).toHaveBeenCalledTimes(1);
    expect(await emission).toBe(false);
    expect(service.getAuthToken()).toBeNull();
  });

  test('restores session data when token is still valid', async () => {
    const activeSession: LoginRes = {
      token: createToken(futureExp(3600)),
      userInfo: defaultUserInfo
    };
    const { service, storage } = createService(activeSession);

    const emission = firstValueFrom(service.isLoggedIn.pipe(take(1)));
    service.restoreSession();

    expect(storage.clear).not.toHaveBeenCalled();
    expect(await emission).toBe(true);
    expect(service.getAuthToken()).toBe(activeSession.token);
  });
});
