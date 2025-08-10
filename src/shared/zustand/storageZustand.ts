import {MMKV} from 'react-native-mmkv'
import { StateStorage } from 'zustand/middleware'

const storage = new MMKV()
export const mmkvPersistor: StateStorage = {
  getItem: (name) => {
    const data =  storage.getString(name)
    if (!data) return null
    return JSON.parse(data)
  },
  setItem: (name, value) => {
    storage.set(name, JSON.stringify(value))
  },
  removeItem: (name) => storage.delete(name),
}





