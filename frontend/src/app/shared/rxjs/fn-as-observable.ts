import {Observable} from 'rxjs';

export function fnAsObservable(fn: Function): () => Observable<void> {
  // Do NOT call `fn` here (binding time). Return a function that when invoked
  // will call `fn` and return an observable that completes after the call.
  return () => new Observable<void>(observer => {
    try {
      if (fn) fn();
      observer.next(void 0);
      observer.complete();
    } catch (err) {
      observer.error(err);
    }
  });
}
