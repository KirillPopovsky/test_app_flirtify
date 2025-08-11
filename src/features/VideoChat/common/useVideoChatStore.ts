import {useVideoChatState} from './videoChatState.ts'

export const useVideoChatStore = () => {
  const state = useVideoChatState()
  const handleJoinRoom = (roomId: string) => {
    const list = [...state.recentRooms.list]
    if (!list.includes(roomId))
      list.unshift(roomId)
    if (list.length > 5)
      list.pop()

    state.recentRooms.set(list)
  }
  return {handleJoinRoom, rooms: state.recentRooms.list}
}
