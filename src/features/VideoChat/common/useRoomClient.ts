import {useCallback, useEffect, useMemo, useState} from 'react'
import {connectToRoom, leaveRoom, startSendingVideo, stopSendingVideo} from '../common/RoomClient'
import type {MediaStream} from 'react-native-webrtc'
import {useRoute} from '../../../shared/navigation/interfaces'
import {Pages} from '../../../shared/navigation/screens'
import {useAuthState} from '../../Authorization/common/authState'
import {useNavigation} from '@react-navigation/native'

type TrackKind = 'audio' | 'video';
type Remote = { producerId: string; kind: TrackKind; stream: MediaStream };

type UseRoomClientResult = {
  endCall: () => void;
  localStream?: MediaStream;
  remoteStreams: MediaStream[];
};

export const useRoomClient = (): UseRoomClientResult => {
  const {roomId} = useRoute<Pages.RoomCall>().params
  const navigation = useNavigation()
  const {credentials} = useAuthState()
  const peerId = credentials?.data?.content?.token ?? ''

  const wsUrl = useMemo(
    () => `wss://v3demo.mediasoup.org:4443/?roomId=${roomId}&peerId=${peerId}`,
    [roomId, peerId],
  )

  const [localStream, setLocalStream] = useState<MediaStream>()
  const [remotes, setRemotes] = useState<Remote[]>([])

  const callbacks = useMemo(
    () => ({
      onRemoteStream: ({producerId, stream, kind}: Remote) => {
        setRemotes(prev => {
          const i = prev.findIndex(r => r.producerId === producerId && r.kind === kind)
          if (i >= 0) {
            const next = prev.slice()
            next[i] = {...next[i], stream}
            return next
          }
          return [...prev, {producerId, kind, stream}]
        });
      },
      onRemoteTrackEnded: ({producerId, kind}: Pick<Remote, 'producerId' | 'kind'>) => {
        setRemotes(prev => prev.filter(r => !(r.producerId === producerId && r.kind === kind)))
      },
      onConnectionStateChange: (_state: { send?: string; recv?: string }) => {
        // опционально: логируй состояние транспорта
        // console.log('[mediasoup] state:', _state);
      },
      onError: (error: unknown) => {
        console.warn('[mediasoup] error:', error)
      }
    }),
    [],
  );

  const connect = useCallback(async () => {
    if (!peerId) {
      console.warn('[mediasoup] empty peerId — abort connect')
      return
    }
    try {
      await connectToRoom({wsUrl, roomId, peerId, callbacks})
      const stream = await startSendingVideo({withAudio: true})
      setLocalStream(stream)
    } catch (e) {
      console.warn('[mediasoup] connect failed:', e)
    }
  }, [wsUrl, roomId, peerId, callbacks]);

  const endCall = useCallback(() => {
    stopSendingVideo()
    leaveRoom()
    navigation.goBack()
  }, [navigation])

  useEffect(() => {
    connect()
    return () => {
      stopSendingVideo()
      leaveRoom()
    };
  }, [connect]);

  const remoteStreams = useMemo(
    () => remotes.filter(r => r.kind === 'video').map(r => r.stream),
    [remotes],
  )

  return {endCall, localStream, remoteStreams}
};
