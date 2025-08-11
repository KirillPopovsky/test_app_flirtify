import {create} from 'zustand'
import {persist} from 'zustand/middleware'
import {createPersistOptions} from '../../../shared/zustand/persist.ts'
import {createList, ICreateList} from '../../../shared/zustand/createList.ts'

export interface IVideoChatState {
  recentRooms: ICreateList<string>
}

export const useVideoChatState = create(persist<IVideoChatState>((set, get) => ({
  ...createList(set, get, 'recentRooms', [] as string[]),
}), createPersistOptions('videochat')))
