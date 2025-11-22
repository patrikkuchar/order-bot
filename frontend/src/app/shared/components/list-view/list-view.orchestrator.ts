import {effect, signal, Signal, WritableSignal} from '@angular/core';
import {PageMetadata, PageReq} from '../../../api';
import {
  FetcherWrapper,
  FilteredFetcher,
  PaginatedFetcher,
  PaginatedFilteredFetcher,
  SimpleFetcher
} from '../../api/fetcher-wrapper';
import {BehaviorSubject, Observable} from 'rxjs';
import {withLoading} from '../../loading-pipe';
import {LoadingService} from '../../../core/services/loading.service';
import {CustomFormGroup} from '../../form/custom/custom-form-group';
import {MyStorage} from '../../persistance/MyStorage';

export type NumberPageConf = {
  pageSize: number;
  pageSizes: number[];
}

export type NextPageConf = {
  firstPageSize: number;
  nextPagesSize: number;
  mode?: 'scroll' | 'button';
  loadAllPreviousPages?: boolean;
}

export type FilterConf<F> = {
  form: CustomFormGroup<F>;
  emitOnChange?: boolean;
}

type ListViewPersistedState<F> = {
  filter?: F;
  pageReq?: PageReq;
}

export type ListViewStatePersistence<F> = {
  mode: 'none' | 'route' | 'localStorage' | 'sessionStorage';
  key?: string;
  persistFilter?: boolean;
  persistPage?: boolean;
  serializer?: (state: ListViewPersistedState<F>) => string;
  deserializer?: (raw: string) => ListViewPersistedState<F>;
}

export type ListViewOrchestratorOpts<T, F> = {
  fetcher: FetcherWrapper<T, F>;
  numberPageConf?: NumberPageConf;
  nextPageConf?: NextPageConf;
  filterConf?: FilterConf<F>;
  loadingSvc?: LoadingService;
  statePersistence?: ListViewStatePersistence<F>;
}

export class ListViewOrchestrator<T = any, F = any> {

  private _filter = signal<F>({} as F);
  private _pageReq: WritableSignal<PageReq>;
  private _pageMetadata = signal<PageMetadata | null>(null);
  private _isLoading = signal<boolean>(false);
  private _data = signal<T[] | null>(null);
  private pageCache = new Map<number, T[]>();

  pageReq: Signal<PageReq>;
  pageMetadata: Signal<PageMetadata | null> = this._pageMetadata.asReadonly();
  isLoading: Signal<boolean> = this._isLoading.asReadonly();
  data: Signal<T[] | null> = this._data.asReadonly();

  paginatorType: 'number' | 'next' | null = null;

  private fetcher: FetcherWrapper<T, F>;
  public numberPageConf?: NumberPageConf;
  public nextPageConf?: NextPageConf;
  public filterConf?: FilterConf<F>;
  private loadingSvc?: LoadingService;
  private statePersistence?: ListViewStatePersistence<F>;
  private storage?: MyStorage<ListViewPersistedState<F>>;

  constructor(opts: ListViewOrchestratorOpts<T, F>) {
    const {
      fetcher,
      numberPageConf,
      nextPageConf,
      filterConf,
      loadingSvc,
      statePersistence
    } = opts;
    this.fetcher = fetcher;
    this.numberPageConf = numberPageConf;
    this.nextPageConf = nextPageConf;
    this.filterConf = filterConf;
    this.loadingSvc = loadingSvc;
    this.statePersistence = statePersistence;

    const persisted = this.initStorageAndLoadState(statePersistence);
    const initialFilter = persisted?.filter ?? this.getInitialFilterValue();
    this._filter.set(initialFilter);

    if (this.filterConf?.form) {
      try {
        this.filterConf.form.updateValue(initialFilter, false);
      } catch (e) {
        console.warn('Failed to sync persisted filter into form', e);
      }
    }

    this._pageReq = signal<PageReq>(persisted?.pageReq ?? this.getDefaultPage());
    this.pageReq = this._pageReq.asReadonly();

    effect(() => {
      this.fetch(this._filter(), this.pageReq());
    });

    if (this.numberPageConf && this.nextPageConf) throw new Error('ListViewOrchestrator cannot have both numberPageConf and nextPageConf defined');
    if (this.numberPageConf) this.paginatorType = 'number';
    if (this.nextPageConf) this.paginatorType = 'next';

    this.persistCurrentState();
  }

  refresh(): void {
    this.fetch(this._filter(), this.pageReq());
  }

  updateFilter(filter: F): void {
    this.pageCache.clear();
    this._data.set(null);
    this._pageMetadata.set(null);
    const defaultPage = this.getDefaultPage();
    const currentPageReq = this._pageReq();
    this._filter.set(filter);
    if (currentPageReq.number !== defaultPage.number || currentPageReq.size !== defaultPage.size) {
      this._pageReq.set(defaultPage);
    }
    this.syncFilterForm(filter);
    this.persistCurrentState();
  }

  updatePageReq(pageReq: PageReq): void {
    const currentPageReq = this._pageReq();
    const isNextPaginator = this.paginatorType === 'next';
    const isForward = isNextPaginator && pageReq.number > currentPageReq.number;

    if (isNextPaginator) {
      if (pageReq.number === 0 && !isForward) {
        this.pageCache.clear();
        this._data.set(null);
        this._pageMetadata.set(null);
      } else if (!isForward && pageReq.number < currentPageReq.number) {
        for (const key of Array.from(this.pageCache.keys())) {
          if (key > pageReq.number) this.pageCache.delete(key);
        }
        this._data.set(this.combinePageCache());
      }
    }

    this._pageReq.set(pageReq);
    this.persistCurrentState();
  }

  private getDefaultPage(): PageReq {
    let pageSize = 10;
    if (this.numberPageConf) pageSize = this.numberPageConf.pageSize;
    if (this.nextPageConf) pageSize = this.nextPageConf.firstPageSize;
    return {
      number: 0,
      size: pageSize
    };
  }

  private fetch(filter: F, pageReq: PageReq): void {
    const fn = this.fetcher.fn;
    const isNextPaginator = this.paginatorType === 'next';
    console.log('fetching with', this.fetcher.type, filter, pageReq);
    switch(this.fetcher.type) {
      case 'simple':
        (fn as SimpleFetcher<T>)().pipe(this.withLoadingIfTemplate()).subscribe(data => this._data.set(data));
        break;
      case 'filtered':
        (fn as FilteredFetcher<T, F>)(filter).pipe(this.withLoadingIfTemplate()).subscribe(data => this._data.set(data));
        break;
      case 'paginated':
        (fn as PaginatedFetcher<T>)(pageReq).pipe(this.withLoadingIfTemplate()).subscribe(res => {
          if (isNextPaginator) {
            this.handleNextPaginationPage(res.content, res.page);
          } else {
            this._data.set(res.content);
          }
          this._pageMetadata.set(res.page);
        });
        break;
      case 'paginatedFiltered':
        (fn as PaginatedFilteredFetcher<T, F>)(filter, pageReq).pipe(this.withLoadingIfTemplate()).subscribe(res => {
          if (isNextPaginator) {
            this.handleNextPaginationPage(res.content, res.page);
          } else {
            this._data.set(res.content);
          }
          this._pageMetadata.set(res.page);
        });
        break;
    }
  }

  readonly withLoadingIfTemplate = <T>(): (source$: Observable<T>) => Observable<T> => {
    // fallback simple fetcher without external inputs
    if (!this.loadingSvc) {
      return (source$: Observable<T>): Observable<T> => source$;
    }

    const loading = new BehaviorSubject<boolean>(false);
    this.isLoading = signal(loading.getValue());
    return (source$: Observable<T>): Observable<T> => source$.pipe(withLoading(loading, this.loadingSvc));
  }

  private handleNextPaginationPage(content: T[], page: PageMetadata): void {
    const currentReq = this._pageReq();
    const pageNumber = (page && typeof page.number === 'number') ? page.number : currentReq.number ?? 0;
    this.pageCache.set(pageNumber, content);
    const combined = this.combinePageCache();
    this._data.set(combined);
  }

  private combinePageCache(): T[] | null {
    if (!this.pageCache.size) return null;
    const orderedKeys = Array.from(this.pageCache.keys()).sort((a, b) => a - b);
    const combined: T[] = [];
    for (const key of orderedKeys) {
      const entries = this.pageCache.get(key);
      if (entries?.length) combined.push(...entries);
    }
    return combined.length ? combined : [];
  }

  private getInitialFilterValue(): F {
    if (this.filterConf?.form) {
      try {
        return this.filterConf.form.getValue();
      } catch {
        return {} as F;
      }
    }
    return {} as F;
  }

  private syncFilterForm(filter: F): void {
    if (!this.filterConf?.form) return;
    try {
      this.filterConf.form.updateValue(filter, false);
    } catch (e) {
      console.warn('Failed to sync filter form value', e);
    }
  }

  private initStorageAndLoadState(statePersistence?: ListViewStatePersistence<F>): ListViewPersistedState<F> | null {
    if (!statePersistence || statePersistence.mode === 'none') return null;
    if (statePersistence.mode === 'route') {
      return this.loadRouteState(statePersistence);
    }

    const storage = this.resolveStorage(statePersistence.mode === 'localStorage' ? 'localStorage' : 'sessionStorage');
    if (!storage) return null;
    const key = statePersistence.key ?? 'list-view-state';
    this.storage = new MyStorage<ListViewPersistedState<F>>(key, storage);
    const stored = this.storage.get();
    if (!stored) return null;

    const parsed = this.applyPersistenceFilters(stored);
    return parsed;
  }

  private loadRouteState(statePersistence: ListViewStatePersistence<F>): ListViewPersistedState<F> | null {
    const key = statePersistence.key ?? 'list-view-state';
    const raw = this.readRouteState(key);
    if (!raw) return null;
    const deserialize = statePersistence.deserializer ?? ((value: string) => JSON.parse(value));
    try {
      return this.applyPersistenceFilters(deserialize(raw) as ListViewPersistedState<F>, statePersistence);
    } catch (e) {
      console.warn('Failed to parse persisted list view state', e);
      return null;
    }
  }

  private persistCurrentState(): void {
    if (!this.statePersistence || this.statePersistence.mode === 'none') return;
    const config = this.statePersistence;
    const state: ListViewPersistedState<F> = {};
    if (config.persistFilter !== false) {
      state.filter = this.cloneValue(this._filter());
    }
    if (config.persistPage !== false) {
      state.pageReq = {...this._pageReq()};
    }
    this.persistState(state);
  }

  private persistState(state: ListViewPersistedState<F>): void {
    if (!this.statePersistence || this.statePersistence.mode === 'none') return;
    const key = this.statePersistence.key ?? 'list-view-state';
    const hasFilter = state.filter != null;
    const hasPage = state.pageReq != null;
    if (!hasFilter && !hasPage) {
      this.clearState(key);
      return;
    }

    if (this.statePersistence.mode === 'route') {
      this.persistInRoute(key, this.serializeState(state));
      return;
    }

    if (!this.storage) return;
    this.storage.save(state);
  }

  private clearState(key: string): void {
    if (!this.statePersistence) return;
    switch (this.statePersistence.mode) {
      case 'localStorage':
      case 'sessionStorage':
        this.storage?.clear();
        break;
      case 'route':
        this.persistInRoute(key, null);
        break;
    }
  }

  private resolveStorage(type: 'localStorage' | 'sessionStorage'): Storage | null {
    if (typeof window === 'undefined') return null;
    try {
      return window[type];
    } catch {
      return null;
    }
  }

  private readRouteState(key: string): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const url = new URL(window.location.href);
      const raw = url.searchParams.get(key);
      if (!raw) return null;
      return decodeURIComponent(raw);
    } catch {
      return null;
    }
  }

  private serializeState(state: ListViewPersistedState<F>): string | null {
    if (!this.statePersistence) return null;
    const serialize = this.statePersistence.serializer ?? ((value: ListViewPersistedState<F>) => JSON.stringify(value));
    try {
      return serialize(state);
    } catch (e) {
      console.warn('Failed to serialize list view state', e);
      return null;
    }
  }

  private applyPersistenceFilters(state: ListViewPersistedState<F>, config: ListViewStatePersistence<F> = this.statePersistence!): ListViewPersistedState<F> {
    const cloned = {...state};
    if (config.persistFilter === false) delete cloned.filter;
    if (config.persistPage === false) delete cloned.pageReq;
    return cloned;
  }

  private persistInRoute(key: string, value: string | null): void {
    if (typeof window === 'undefined') return;
    try {
      const url = new URL(window.location.href);
      if (value == null) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, encodeURIComponent(value));
      }
      const next = `${url.pathname}${url.search}${url.hash}`;
      window.history.replaceState({}, '', next);
    } catch (e) {
      console.warn('Failed to persist list view state in route', e);
    }
  }

  private cloneValue<V>(value: V): V {
    if (value == null) return value;
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return { ...(value as any) };
    }
  }
}
