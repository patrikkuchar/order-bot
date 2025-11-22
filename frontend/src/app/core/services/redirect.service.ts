import {Injectable} from '@angular/core';
import {NavigationExtras, Router} from '@angular/router';
import {RoutePath} from '../../app/routes/types';
import {MyStorage} from '../../shared/persistance/MyStorage';

type NavigationCmd = {
  path: any,
  extras?: NavigationExtras
}

@Injectable({
  providedIn: 'root'
})
export class RedirectService {

  private storage = new MyStorage<NavigationCmd>('redirectStore', localStorage, 10);

  constructor(private router: Router) { }

  store<T extends RoutePath>(pathFn: T, extras?: NavigationExtras, ...args: Parameters<T>): void {
    const pathArray = this.getPathArray(pathFn, ...args);
    this.storage.save({path: pathArray, extras});
  }

  storeThis(): void {
    const path = this.router.url;
    this.storage.save({path: [path]});
  }

  withStored<T extends RoutePath>(defaultPathFn?: T, ...argsM: Parameters<T>): void {
    const cmd = this.storage.get();
    if (cmd) {
      this.navigate(cmd);
      this.storage.clear();
    } else if (defaultPathFn) {
      this.to(defaultPathFn, undefined, ...argsM);
    }
  }

  to<T extends RoutePath>(pathFn: T, extras?: NavigationExtras, ...args: Parameters<T>): void {
    const pathArray = this.getPathArray(pathFn, ...args);
    this.navigate({path: pathArray, extras});
  }

  toExternal(url: string): void {
    if (this.isValidUrl(url)) {
      window.location.href = url;
    } else {
      console.error('Cannot redirect, Invalid URL:', url);
    }
  }

  private navigate(cmd: NavigationCmd): void {
    this.router.navigate(cmd.path, cmd.extras);
  }

  private getPathArray<T extends RoutePath>(pathFn: T, ...args: Parameters<T>): any {
    const pathArray = (pathFn as Function).apply(undefined, args);
    return Array.isArray(pathArray) ? pathArray : [pathArray];
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
