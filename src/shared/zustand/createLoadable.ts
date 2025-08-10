import type {StoreApi} from 'zustand';
import {Loadable, Loading, isLoading as checkIsLoading, failed} from '../common/Loading';

export type ICreateLoadable<DATA> = {
  data: Loadable<DATA>;
  set: (data: Loadable<DATA>) => void;
  start: () => void;
  complete: (data: DATA) => void;
  fail: (error?: Error) => void;
  clear: () => void;
  isLoading: () => boolean;
  isError: () => boolean;
};

const loadableStoreCreator = <DATA>(
  set: (v: Loadable<DATA>) => void,
  get: () => Loadable<DATA>,
  initialState: Loadable<DATA>,
): ICreateLoadable<DATA> => {
  const _set = (data: Loadable<DATA>) => {
    set(data);
  };

  const start = () => {
    const loadingState = Loading.refreshing;
    _set({loadingState, content: get().content, error: undefined});
  };

  const complete = (data: DATA) => {
    const loadingState = Loading.idle;
    _set({loadingState, content: data});
  };

  const fail = (error?: Error) => {
    const loadingState = Loading.failed;
    _set({loadingState, content: initialState.content, error});
  };

  const clear = () => {
    const loadingState = Loading.blank;
    set({loadingState, content: initialState.content, error: undefined});
  };
  const isLoading = () => checkIsLoading(get().loadingState);

  const isError = () => failed(get().loadingState);

  return {data: initialState, set: _set, start, complete, fail, clear, isLoading, isError};
};

export const createLoadable = <DATA, State, K extends keyof State>(
  set: StoreApi<State>['setState'],
  get: StoreApi<State>['getState'],
  name: K,
  initialState: DATA,
): Record<K, ICreateLoadable<DATA>> => {
  return {
    [name]: loadableStoreCreator<DATA>(
      data => {
        set(state => {
          return {[name]: {...state[name], data}} as Partial<State>;
        });
      },
      () => (get()[name] as ICreateLoadable<DATA>).data,
      {loadingState: Loading.blank, content: initialState},
    ),
  } as Record<K, ICreateLoadable<DATA>>;
};
