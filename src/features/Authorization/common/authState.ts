import {createLoadable, ICreateLoadable} from '../../../shared/zustand/createLoadable.ts'
import {create} from 'zustand'
import {persist} from 'zustand/middleware'
import {createPersistOptions} from '../../../shared/zustand/persist.ts'

export type Credentials = {
  token?: string;
}
export interface IAuthState {
  credentials: ICreateLoadable<Credentials>;
}

export const useAuthState = create(persist<IAuthState>((set, get) => ({
  ...createLoadable(set, get, 'credentials',  {}),
}),createPersistOptions('credentials')))
