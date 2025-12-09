import {Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FormUtils} from '../../../../utils/form.utils';
import {BehaviorSubject, debounceTime, filter, from, Observable, Observer} from 'rxjs';
import {ApiHandlingService} from '../../../../../core/services/api-handling.service';
import {RouteArgs, RoutePath} from '../../../../../app/routes/types';
import {CustomFormGroup} from '../../../../form/custom/custom-form-group';
import {withLoading} from '../../../../loading-pipe';
import {LoadingService} from '../../../../../core/services/loading.service';

@Component({
  selector: 'app-form',
  imports: [
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <form (submit)="submit($event)" [formGroup]="form">
      <div class="flex flex-col min-w-full place-content-center gap-6">
        <ng-content></ng-content>
      </div>
    </form>
  `
})
export class FormComponent<T = any, R = any> implements OnInit, OnChanges {

  @Input({required: true}) form: CustomFormGroup<T>;
  @Input({required: true}) onSubmit: (formData: T) => Observable<R> | Promise<R>;
  @Input() submitHandler?: Observer<R>;
  @Input() redirectOnSuccess?: (data: R) => RouteArgs<RoutePath> | RoutePath;

  @Input() submitStrategy: 'onButtonClick' | 'onFormChange' = 'onButtonClick';

  @Input() dataFetcher?: () => Observable<T>;

  @Input() resetOnSubmit = true;
  @Input() shouldSubmit?: () => boolean;
  @Input() dataPrepareBeforeSubmit?: (formData: T) => T;

  @Input() initDataLoadingSubject: BehaviorSubject<boolean>;
  @Output() initDataLoading = new EventEmitter<boolean>();

  private _initDataLoading = new BehaviorSubject<boolean>(false);
  private _shouldTrackLoading = false;

  constructor(private el: ElementRef,
              private handler: ApiHandlingService,
              private loadingSvc: LoadingService) {}

  ngOnInit() {
    this._shouldTrackLoading = this.initDataLoading.observed || !!this.initDataLoadingSubject;

    let redirect: ((data: R) => RouteArgs<RoutePath> | RoutePath) | undefined = undefined;
    if (this.redirectOnSuccess) {
      redirect = this.redirectOnSuccess;
    }

    this.submitHandler ??= this.handler.handle({
      onSuccess: () => {
        if (this.resetOnSubmit)
          this.form.reset();
        this.fetchDataIfProvided();
      },
      redirect,
      silentSuccess: true
    });

    this.fetchDataIfProvided();

    if (this._shouldTrackLoading) {
      this._initDataLoading.subscribe(isLoading => {
        this.initDataLoading.emit(isLoading);
        this.initDataLoadingSubject?.next(isLoading);
      });
    }

    if (this.submitStrategy === 'onFormChange') {
      this.form.valueChanges
        .pipe(
          filter(() => this.form.valid),
          debounceTime(300),
        )
        .subscribe(() => this.submit(new Event('submit')));
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataFetcher'] && !changes['dataFetcher'].isFirstChange()) {
      this.fetchDataIfProvided();
    }
  }

  private fetchDataIfProvided() {
    if (!this.dataFetcher) return;

    let fetcher = this.dataFetcher();
    if (this._shouldTrackLoading)
      fetcher = fetcher.pipe(withLoading(this._initDataLoading, this.loadingSvc));

    fetcher.subscribe(data => this.form.updateInitialValue(data));
  }

  submit(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    if (this.form.valid) {
      if (this.shouldSubmit?.()) {
        return;
      }

      const data = this.dataPrepareBeforeSubmit?.(this.form.getRawValue() as T) ?? this.form.getRawValue() as T;

      from(this.onSubmit(data)).subscribe(this.submitHandler);
    } else {
      FormUtils.validateAllFormFields(this.form);
      setTimeout(() => {
        FormUtils.scrollToFirstInvalidControl(this.el.nativeElement);
      })
    }
  }
}
