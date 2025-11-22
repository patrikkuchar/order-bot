import {computed, Injectable, signal} from '@angular/core';
import {toSignal, toObservable} from '@angular/core/rxjs-interop';
import {debounceTime, distinctUntilChanged} from 'rxjs';
import {RandomUtils} from '../../shared/utils/random.utils';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private _lockedLoading = signal(false);
  private _globalLoadings = signal(new Set<string>());
  private _loading = computed(() => this._globalLoadings().size > 0 && !this._lockedLoading());
  showLoading = toSignal(
    toObservable(this._loading).pipe(
      debounceTime(300),
      distinctUntilChanged()
    ),
    { initialValue: false }
  );

  show(): string {
    const id = RandomUtils.uuid();
    this._globalLoadings.update(set => {
      const newSet = new Set(set);
      newSet.add(id);
      return newSet;
    });
    return id;
  }

  hide(id: string): void {
    this._globalLoadings.update(set => {
      const newSet = new Set(set);
      newSet.delete(id);
      return newSet;
    });
  }

  lockAll(): void {
    this._lockedLoading.set(true);
  }

  unlockAll(): void {
    this._lockedLoading.set(false);
  }
}
