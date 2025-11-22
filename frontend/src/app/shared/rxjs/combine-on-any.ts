import {merge, Observable, map, scan} from 'rxjs';

/**
 * Combine an object of optional Observables and emit whenever any of them emits.
 * - `sources` is an object where values may be `Observable<V>` or `undefined`.
 * - When any source emits the returned Observable emits { values, triggered }
 *   where `values` contains the latest values for sources that emitted a non-undefined value
 *   (we intentionally omit entries whose latest value is `undefined` which covers `Observable<void>`
 *   and also skipped/never-yet-emitted sources).
 * - `triggered` is the key of the source that caused the emission.
 *
 * Usage example:
 *   combineEmitOnAny({refresh: refresh$, filter: filter$, pageReq: pageReq$})
 *     .subscribe(({values, triggered}) => { /* values.filter / values.pageReq etc. * / })
 */
export function combineEmitOnAny<T extends Record<string, Observable<any> | undefined>>(sources: T): Observable<{
  values: Partial<{[K in keyof T]: T[K] extends Observable<infer U> ? U : never}>;
  triggered: keyof T;
}> {
  const entries = Object.entries(sources) as [keyof T, T[keyof T]][];

  // create array of observables that emit [key, value]
  const mapped = entries
    .filter(([, obs]) => obs != null)
    .map(([key, obs]) =>
      (obs as Observable<any>).pipe(
        map(v => [key, v] as const)
      )
    );

  if (mapped.length === 0) {
    // no sources provided -> never emit
    return new Observable(subscriber => subscriber.complete());
  }

  // merge all and keep latest values in state
  return merge(...mapped).pipe(
    scan((state, [key, value]) => {
      // update latest value for key
      const next = {...state.latest, [key as string]: value};
      return { latest: next, triggered: key } as any;
    }, { latest: {} as Record<string, any>, triggered: entries[0][0] } as { latest: Record<string, any>; triggered: keyof T }),
    map(s => {
      // build values object containing only keys whose latest value !== undefined
      const cleaned: Record<string, any> = {};
      for (const k of Object.keys(s.latest)) {
        const v = s.latest[k];
        if (v !== undefined) cleaned[k] = v;
      }
      return { values: cleaned as any, triggered: s.triggered };
    })
  );
}

