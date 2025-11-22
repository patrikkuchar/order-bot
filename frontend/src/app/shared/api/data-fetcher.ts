import {Observable} from 'rxjs';

/**
 * Creates a fetcher that calls `fetch()` on the first `subscribe`, stores the result,
 * and then emits it. Subsequent `subscribe` calls immediately emit the stored
 * data without calling `fetch()` again.
 */
export const dataFetcher = <T>(fetch: () => Observable<T>, abc = 'string'): Observable<T> => {
  let data: T | null = null;
  return new Observable<T>((observer) => {
    if (data) {
      observer.next(data);
      return;
    }
    fetch().subscribe((d) => {
      data = d;
      observer.next(d);
    });
  });
};
