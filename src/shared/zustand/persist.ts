import {createJSONStorage, PersistOptions} from 'zustand/middleware'
import {mmkvPersistor} from './storageZustand.ts'


export const createPersistOptions =  <S, PersistedState = S>(key: string): PersistOptions<S, PersistedState> => ({
  name: key,
  storage: createJSONStorage(() => mmkvPersistor),
  merge: (persistedState: any, currentState: any) => {
    const nextState: any = {}
    Object.entries(currentState).forEach(([_key, _value]) => {
      nextState[_key] = Object.assign({}, _value, persistedState[_key])
    })
    return nextState
  },
})
