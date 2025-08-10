import type {StoreApi} from 'zustand';

export type ICreateMap<ITEM> = {
  map: Record<string, ITEM>;
  set: (items: Record<string, ITEM>) => void;
  get: () =>  Record<string, ITEM>;
  values: () => ITEM[];
  add: (key: string, value: ITEM) => void;
  remove: (key: string) => void;
  update: (key: string, value: ITEM) => void;
  clear: () => void;
};

const mapStoreCreator = <ITEM>(
  set: (v: Record<string, ITEM>) => void,
  get: () => Record<string, ITEM>,
  initialState: Record<string, ITEM>,
): ICreateMap<ITEM> => {
  const add = (key: string, value: ITEM) => {
    const data = {...get()};
    if (data[key] !== value) {
      data[key] = value;
      set(data);
    }
  };

  const remove = (key: string) => {
    const data = {...get()};
    if (key in data) {
      delete data[key];
      set(data);
    }
  };

  const update = (key: string, value: ITEM) => {
    const data = {...get()};
    if (data[key] !== value) {
      data[key] = value;
      set(data);
    }
  };

  const clear = () => {
    set({});
  };
  const values = () => Array.from(Object.values(get()))

  return {map: initialState, set, get, values, remove, add, clear, update};
};

export const createMap = <ITEM, State, K extends keyof State>(
  set: StoreApi<State>['setState'],
  get: StoreApi<State>['getState'],
  name: K,
  initialState: Record<string, ITEM>,
): Record<K, ICreateMap<ITEM>> => {
  return {
    [name]: mapStoreCreator<ITEM>(
      map => {
        set(state => {
          return {[name]: {...state[name], map}} as Partial<State>;
        });
      },
      () => (get()[name] as ICreateMap<ITEM>).map,
      initialState,
    ),
  } as Record<K, ICreateMap<ITEM>>;
};
