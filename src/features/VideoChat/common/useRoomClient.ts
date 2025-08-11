import {useCallback, useEffect, useMemo, useState} from 'react'
import {connectToRoom, leaveRoom, startSendingVideo, stopSendingVideo} from '../common/RoomClient.ts'
import {MediaStream} from 'react-native-webrtc'
import {useRoute} from '../../../shared/navigation/interfaces.ts'
import {Pages} from '../../../shared/navigation/screens.ts'
import {useAuthState} from '../../Authorization/common/authState.ts'
import {useNavigation} from '@react-navigation/native'

type Remote = { producerId: string; kind: 'video' | 'audio'; stream: MediaStream };
type Unknown = Record<string, any>

export const useRoomClient = () => {
  const {roomId} = useRoute<Pages.RoomCall>().params
  const navigation = useNavigation()
  const peerId = useAuthState().credentials.data.content.token ?? ''
  const wsUrl = `wss://v3demo.mediasoup.org:4443/?roomId=${roomId}&peerId=${peerId}`

  const [localStream, setLocalStream] = useState<MediaStream | undefined>()
  const [remotes, setRemotes] = useState<Remote[]>([])


  const callbacks = useMemo(
    () => ({
      onRemoteStream: ({producerId, stream, kind}: Unknown) => {
        setRemotes(prev => {
          const exists = prev.find(r => r.producerId === producerId && r.kind === kind)
          if (exists) return prev.map(r => (r.producerId === producerId && r.kind === kind ? {...r, stream} : r))
          return [...prev, {producerId, kind, stream}]
        })
      },
      onConnectionStateChange: (stateObj: Unknown) => {
      },
      onRemoteTrackEnded: ({producerId, kind}: Unknown) => {
        setRemotes(prev => prev.filter(r => !(r.producerId === producerId && r.kind === kind)))
      },
      onError: (error: unknown) => {
        console.warn('mediasoup error', error)
      },
    }),
    [],
  )

  const handleConnect = useCallback(async () => {
    try {
      await connectToRoom({wsUrl, roomId, peerId, callbacks})
      const ls = await startSendingVideo({withAudio: true})
      setLocalStream(ls)
    } catch (e) {
      console.warn('connect error', e)
    }
  }, [wsUrl, roomId, peerId, callbacks])

  const onEndCallPress = useCallback(() => {
    leaveRoom()
    navigation.goBack()
  }, [])

  useEffect(() => {
    handleConnect()
    return () => {
      stopSendingVideo()
      leaveRoom()
    }
  }, [])
  const remoteStreams = remotes
    .filter(r => r.kind === 'video')
    .map(r => r.stream)

  return {onEndCallPress, localStream, remoteStreams}
}
