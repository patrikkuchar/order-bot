import {Directive, OnDestroy} from '@angular/core';
import {Subject, MonoTypeOperatorFunction} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Directive()
export class DestroyableDirective implements OnDestroy {
  // avoid generics to prevent TSX/JSX parse problems in some TS configurations
  protected destroy$ = new Subject();

  ngOnDestroy(): void {
    // Subject.next expects an argument in this TS configuration — send undefined as the signal
    this.destroy$.next(undefined);
    this.destroy$.complete();
  }

  protected untilDestroy<T>(): MonoTypeOperatorFunction<T> {
    return takeUntil<T>(this.destroy$);
  }
}
