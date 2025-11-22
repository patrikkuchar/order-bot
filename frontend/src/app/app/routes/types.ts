import {AppRoutes} from '../../app.routes';

type DeepRouteFunctions<T> = T extends (...args: any[]) => string[]
  ? T  // Ak je to funkcia vracajúca string[], pridaj ju do union
  : T extends object
    ? { [K in keyof T]: DeepRouteFunctions<T[K]> }[keyof T]  // Rekurzívne zbiera z kľúčov
    : never;

// RoutePath je teraz union funkcií, nie ich return hodnôt.
export type RoutePath = DeepRouteFunctions<typeof AppRoutes>;

export interface RouteArgs<T extends RoutePath> {
  pathFn: T;
  args?: Parameters<T>;
}
