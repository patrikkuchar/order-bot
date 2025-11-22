import {BehaviorSubject, finalize, Observable} from 'rxjs';
import {LoadingService} from '../core/services/loading.service';

export const withLoading = <T>(
  loading$: BehaviorSubject<boolean>,
  loadingSvc?: LoadingService
): (source$: Observable<T>) => Observable<T> => {
  return (source$: Observable<T>) => {
    loading$.next(true);
    loadingSvc?.lockAll()
    return source$.pipe(
      finalize(() => {
        loading$.next(false);
        loadingSvc?.unlockAll();
      })
    );
  }
}
