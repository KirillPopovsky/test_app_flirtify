import type {StoreApi} from 'zustand';
import {isRefreshing, Loading} from '../common/Loading.ts';

type List<ITEM> = {
  items: ITEM[];
  page: number;
  loading: Loading;
};
export type ICreateInfiniteList<ITEM> = {
  list: List<ITEM>;
  edit: {
    set: (items: List<ITEM>) => void;
    add: (items: ITEM[]) => void;
    remove: (items: ITEM[]) => void;
    toggle: (item: ITEM) => void;
    update: (item: ITEM) => void;
    clear: () => void;
  };
  loading: {
    start: (loadingAction: Loading) => number;
    complete: (items: ITEM[]) => void;
    fail: () => void;
  };
};

const defaultCompare = <ITEM>(left: ITEM, right: ITEM): boolean => left === right;

const infiniteListStoreCreator = <ITEM>(
  set: (v: List<ITEM>) => void,
  get: () => List<ITEM>,
  initialState: List<ITEM>,
  params?: {
    processingBeforeSet?: (items: ITEM[]) => ITEM[];
    compare?: (left: ITEM, right: ITEM) => boolean;
  },
): ICreateInfiniteList<ITEM> => {
  const compare = params?.compare || defaultCompare;

  const _set = (list: List<ITEM>) => {
    set({items: params?.processingBeforeSet ? params.processingBeforeSet(list.items) : list.items, page: list.page, loading: list.loading});
  };

  const start = (loading: Loading) => {
    const items = loading === Loading.initial ? [] : get().items;
    const oldPage = get().page;
    const page = isRefreshing(loading) ? 1 : loading === Loading.more ? oldPage + 1 : oldPage;
    _set({loading, page, items});

    return page;
  };

  const complete = (items: ITEM[]) => {
    const loading = Loading.idle;
    const loadingAction = get().loading;
    const page = get().page;
    const result = isRefreshing(loadingAction) ? items : [...get().items, ...items];
    _set({loading, page, items: result});
  };
  const fail = () => {
    _set({loading: Loading.failed, page: initialState.page, items: initialState.items});
  };

  const add = (items: ITEM[]) => {
    const values = items.filter(existing => get().items.every(item => !compare(existing, item)));
    _set({...get(), items: [...get().items, ...values]});
  };

  const remove = (remove: ITEM[]) => {
    _set({...get(), items: get().items.filter(item => !remove.find(removeItem => compare(item, removeItem)))});
  };

  const update = (item: ITEM) => {
    _set({...get(), items: get().items.map(existing => (compare(existing, item) ? item : existing))});
  };

  const toggle = (item: ITEM) => {
    const exist = !!get().items.find(_item => compare(item, _item));

    if (exist) {
      remove([item]);
    } else {
      add([item]);
    }
  };

  const clear = () => {
    set(initialState);
  };

  return {list: initialState, edit: {set: _set, remove, add, clear, toggle, update}, loading: {start, complete, fail}};
};

export const createInfiniteList = <ITEM, State, K extends keyof State>(
  set: StoreApi<State>['setState'],
  get: StoreApi<State>['getState'],
  name: K,
  initialState: List<ITEM>,
  params?: {
    processingBeforeSet?: (items: ITEM[]) => ITEM[];
    compare?: (left: ITEM, right: ITEM) => boolean;
    patchEffect?: (items: ITEM[]) => Partial<State>;
  },
): Record<K, ICreateInfiniteList<ITEM>> => {
  return {
    [name]: infiniteListStoreCreator<ITEM>(
      list => {
        set(state => {
          return {...params?.patchEffect?.(list.items), [name]: {...state[name], list}};
        });
      },
      () => (get()[name] as ICreateInfiniteList<ITEM>).list,
      initialState,
      params,
    ),
  } as Record<K, ICreateInfiniteList<ITEM>>;
};
