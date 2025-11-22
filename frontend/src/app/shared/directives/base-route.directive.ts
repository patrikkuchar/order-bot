import {Directive, inject} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {toSignal} from '@angular/core/rxjs-interop';

@Directive() // nebude renderovať nič, len slúži ako base class
export abstract class BaseRouteDirective {
  protected readonly route = inject(ActivatedRoute);

  // Jednotlivý param podľa key (path param)
  param<T = string>(key: string) {
    return toSignal(
      this.route.paramMap.pipe(
        map(params => (params.get(key) as unknown as T) ?? null)
      ),
      { initialValue: null }
    );
  }

  idParam<T = string>() {
    return this.param<T>('id');
  }

  // Všetky params ako objekt
  params<T extends Record<string, any> = Record<string, any>>() {
    return toSignal(
      this.route.paramMap.pipe(
        map(params => {
          const obj: Record<string, any> = {};
          params.keys.forEach(k => (obj[k] = params.get(k)));
          return obj as T;
        })
      ),
      { initialValue: {} as T }
    );
  }

  // Jednotlivý query param
  queryParam<T = string>(key: string) {
    return toSignal(
      this.route.queryParamMap.pipe(
        map(params => (params.get(key) as unknown as T) ?? null)
      ),
      { initialValue: null }
    );
  }

  // Všetky query params ako objekt
  queryParams<T extends Record<string, any> = Record<string, any>>() {
    return toSignal(
      this.route.queryParamMap.pipe(
        map(params => {
          const obj: Record<string, any> = {};
          params.keys.forEach(k => (obj[k] = params.get(k)));
          return obj as T;
        })
      ),
      { initialValue: {} as T }
    );
  }

  // Fragment -> napr. #top
  fragment() {
    return toSignal(this.route.fragment, { initialValue: null });
  }

  // Snapshot access (ostáva rovnaké)
  snapshot<T = any>(key: string, from: 'param' | 'query' = 'param'): T | null {
    if (from === 'param') {
      return (this.route.snapshot.paramMap.get(key) as unknown as T) ?? null;
    }
    return (this.route.snapshot.queryParamMap.get(key) as unknown as T) ?? null;
  }
}
