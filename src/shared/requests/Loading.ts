export enum Loading {
  //pending statuses
  blank = 'blank', //there is nothing loaded so far
  idle = 'idle', //some data was loaded, pending refreshing or loading more
  failed = 'failed', // loading failed
  completed = 'completed', //there is nothing to load more

  //loading statuses
  initial = 'initial', // first loading, used for infinite lists
  refreshing = 'refreshing', //refreshing 0_o
  more = 'more', // loading additional data, used for infinite lists
}
//blank>>initial>>failed>>refreshing>>idle>>more>>completed

const loadingStates = [Loading.more, Loading.refreshing, Loading.initial];
const refreshingStates = [Loading.refreshing, Loading.initial];

export function isLoading(loadState?: Loading): boolean {
  return loadState ? loadingStates.indexOf(loadState) > -1 : false;
}

export function failed(loadState?: Loading): boolean {
  return loadState === Loading.failed;
}

export function isRefreshing(loadState?: Loading): boolean {
  return loadState ? refreshingStates.indexOf(loadState) > -1 : false;
}

export type Loadable<T> = {
  loadingState: Loading;
  content: T;
  error?: Error;
};
