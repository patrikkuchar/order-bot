import {PageMetadata, PageReq} from '../../api';
import {Observable} from 'rxjs';

export type PaginatedResponse<T> = {
  content: T[];
  page: PageMetadata
}
export type SimpleFetcher<T> = () => Observable<T[]>;
export type FilteredFetcher<T, F> = (filter: F) => Observable<T[]>;
export type PaginatedFetcher<T> = (req: PageReq) => Observable<PaginatedResponse<T>>;
export type PaginatedFilteredFetcher<T, F> = (filter: F, req: PageReq) => Observable<PaginatedResponse<T>>;

type WrappedFetcher<T, F> = SimpleFetcher<T> | FilteredFetcher<T, F> | PaginatedFetcher<T> | PaginatedFilteredFetcher<T, F>;

export type FetcherType = 'simple' | 'filtered' | 'paginated' | 'paginatedFiltered';

export type FetcherWrapper<T, F> = {
  fn: WrappedFetcher<T, F>,
  type: any
}

export function createFetcher<T>(
  fn: () => Observable<T[]>,
  type: 'simple'
): { fn: SimpleFetcher<T>, type: 'simple' };

export function createFetcher<T, F>(
  fn: (filter: F) => Observable<T[]>,
  type: 'filtered'
): { fn: FilteredFetcher<T, F>, type: FetcherType };

export function createFetcher<T>(
  fn: (req: PageReq) => Observable<PaginatedResponse<T>>,
  type: 'paginated'
): { fn: PaginatedFetcher<T>, type: FetcherType };

export function createFetcher<T, F>(
  fn: (filter: F, req: PageReq) => Observable<PaginatedResponse<T>>,
  type: 'paginatedFiltered'
): { fn: PaginatedFilteredFetcher<T, F>, type: FetcherType };

// Implementácia (jediný bod)
export function createFetcher<T, F>(fn: Function, type: FetcherType): FetcherWrapper<T, F> {
  return {
    fn: fn as WrappedFetcher<T, F>,
    type: type
  };
}
