import * as mediasoupClient from 'mediasoup-client'
import type {
  Consumer,
  DtlsParameters,
  IceCandidate,
  IceParameters,
  Producer,
  RtpCapabilities,
  RtpParameters,
} from 'mediasoup-client/lib/types'

import {mediaDevices, MediaStream, MediaStreamTrack, registerGlobals} from 'react-native-webrtc'
import * as protoo from 'protoo-client'
import RTCRtpEncodingParameters from 'react-native-webrtc/lib/typescript/RTCRtpEncodingParameters'

registerGlobals();

export type TrackKind = 'audio' | 'video';

export interface ConnectOptions {
  wsUrl: string;
  roomId?: string;
  peerId: string;
  callbacks?: Callbacks;
}

export interface Callbacks {
  onNotification?: (n: ProtooNotification) => void
  onRemoteStream?: (p: { producerId: string; stream: MediaStream; kind: TrackKind }) => void
  onRemoteTrackEnded?: (p: { producerId?: string; kind?: TrackKind }) => void;
  onConnectionStateChange?: (state: { send?: string; recv?: string }) => void;
  onError?: (error: unknown) => void;
}

export interface ProtooNotification {
  method: string;
  data?: unknown;
}

export interface ProtooRequest {
  method: string;
  data?: unknown;
}

type Direction = 'send' | 'recv';

interface BaseTransport {
  id: string;

  close(): void;

  on(event: 'connect' | 'connectionstatechange' | 'produce', ...args: any[]): void;
}

export interface SendTransportLike extends BaseTransport {
  produce(opts: {
    track: MediaStreamTrack;
    appData?: any;
    encodings?: RTCRtpEncodingParameters[];
  }): Promise<Producer>;
}

export interface RecvTransportLike extends BaseTransport {
  consume(opts: {
    id: string;
    producerId: string;
    kind: TrackKind;
    rtpParameters: RtpParameters;
    appData?: any;
  }): Promise<Consumer>;
}

export interface StateSnapshot {
  deviceLoaded: boolean;
  hasSendTransport: boolean;
  hasRecvTransport: boolean;
  producers: TrackKind[];
  consumers: string[];
  remoteStreamsCount: number;
}

let device: mediasoupClient.Device | null = null;
let protooPeer: protoo.Peer | null = null;
let sendTransport: SendTransportLike | null = null;
let recvTransport: RecvTransportLike | null = null;

const producers = new Map<TrackKind, Producer>()
const consumers = new Map<string, Consumer>()
const remoteStreams = new Map<string, MediaStream>()

let localStream: MediaStream | null = null;
let callbacks: Callbacks = {}

function emit<K extends keyof Callbacks>(
  name: K,
  payload: Parameters<NonNullable<Callbacks[K]>>[0],
) {
  const func = callbacks[name] as any
  if (typeof func === 'function') {
    try {
      func(payload)
    } catch (error) {
      console.warn(`[mediasoupClient] callback ${String(name)} threw`, error)
    }
  }
}

function stopAndReleaseStream(stream?: MediaStream | null) {
  if (!stream) return
  stream.getTracks().forEach((track) => {
    track.stop()
  })
}

async function tryRequest(method: string, data?: any) {
  if (!protooPeer) throw new Error('Protoo not connected')
  return protooPeer.request(method, data)
}

async function resumeConsumer(consumerId: string) {
  try {
    await tryRequest('resumeConsumer', {consumerId})
  } catch {
    await tryRequest('consumerResume', {consumerId}).catch(() => {
    })
  }
}

export async function connectToRoom({
                                      wsUrl,
                                      roomId,
                                      peerId,
                                      callbacks = {},
                                    }: ConnectOptions): Promise<boolean> {
  callbacks = {...callbacks, ...callbacks}

  const transport = new protoo.WebSocketTransport(wsUrl);
  protooPeer = new protoo.Peer(transport);

  return new Promise<boolean>((resolve, reject) => {
    if (!protooPeer) return reject(new Error('Protoo peer not created'))

    protooPeer.on('open', async () => {
      try {
        const routerRtpCapabilities = (await tryRequest('getRouterRtpCapabilities')) as RtpCapabilities
        device = new mediasoupClient.Device();
        await device.load({ routerRtpCapabilities });

        {
          const t = (await tryRequest('createWebRtcTransport', {
            producing: true,
            consuming: false,
          })) as {
            id: string;
            iceParameters: IceParameters;
            iceCandidates: IceCandidate[];
            dtlsParameters: DtlsParameters;
          };

          sendTransport = device.createSendTransport({
            id: t.id,
            iceParameters: t.iceParameters,
            iceCandidates: t.iceCandidates,
            dtlsParameters: t.dtlsParameters,
            iceServers: [],
          }) as unknown as SendTransportLike;

          setupTransportEvents(sendTransport, 'send');
        }

        {
          const t = (await tryRequest('createWebRtcTransport', {
            producing: false,
            consuming: true,
          })) as {
            id: string;
            iceParameters: IceParameters;
            iceCandidates: IceCandidate[];
            dtlsParameters: DtlsParameters;
          };

          recvTransport = device.createRecvTransport({
            id: t.id,
            iceParameters: t.iceParameters,
            iceCandidates: t.iceCandidates,
            dtlsParameters: t.dtlsParameters,
            iceServers: [],
          }) as unknown as RecvTransportLike;

          setupTransportEvents(recvTransport, 'recv');
        }

        attachProtooRequestHandlers();

        await tryRequest('join', {
          roomId,
          displayName: peerId,
          device: { name: 'React Native' },
          rtpCapabilities: device.rtpCapabilities,
        });

        protooPeer!.on('notification', (n: ProtooNotification) => {
          emit('onNotification', n);

          if (n.method !== 'producerClosed') return

          const {producerId, kind} = (n.data || {}) as {
            producerId?: string;
            kind?: TrackKind;
          }

          for (const [consumerId, consumer] of consumers) {
            if (consumer.producerId === producerId) {
              try {
                consumer.track?.stop?.()
              } catch {
              }
              try {
                consumer.close()
              } catch {
              }
              consumers.delete(consumerId)
            }
          }

          if (producerId && remoteStreams.has(producerId)) {
            const s = remoteStreams.get(producerId)!
            stopAndReleaseStream(s)
            remoteStreams.delete(producerId)
            emit('onRemoteTrackEnded', {producerId, kind})
          }
        });

        resolve(true);
      } catch (error) {
        console.error('[mediasoupClient] connect error', error)
        callbacks.onError?.(error)
        reject(error)
      }
    });

    protooPeer.on('failed', () => {
      const error = new Error('Protoo connection failed')
      callbacks.onError?.(error)
      reject(error)
    });
  });
}

export async function startSendingVideo(
  {withAudio = true}: { withAudio?: boolean } = {},
): Promise<MediaStream> {
  if (!sendTransport) throw new Error('sendTransport not ready');

  localStream = await mediaDevices.getUserMedia({ video: true, audio: !!withAudio });

  const videoTrack = localStream.getVideoTracks?.()[0];
  const audioTrack = withAudio ? localStream.getAudioTracks?.()[0] : null;

  if (videoTrack) {
    const videoProducer = await sendTransport.produce({track: videoTrack})
    producers.set('video', videoProducer)
  }

  if (audioTrack) {
    const audioProducer = await sendTransport.produce({track: audioTrack})
    producers.set('audio', audioProducer)
  }

  return localStream;
}

/**
 * Остановка локальной публикации.
 */
export async function stopSendingVideo(): Promise<void> {
  for (const [, producer] of producers) {
    try {
      producer.track?.stop?.()
    } catch {
    }
    try {
      producer.close()
    } catch {
    }
  }
  producers.clear();

  stopAndReleaseStream(localStream)
  localStream = null
}

export async function leaveRoom(): Promise<void> {
  try {
    await stopSendingVideo();

    for (const [, consumer] of consumers) {
      try {
        consumer.track?.stop?.()
      } catch {
      }
      try {
        consumer.close()
      } catch {
      }
    }
    consumers.clear();

    try {
      recvTransport?.close()
    } catch {
    }
    try {
      sendTransport?.close()
    } catch {
    }
    recvTransport = null
    sendTransport = null

    try { await protooPeer?.request('leave'); } catch {}
    try {
      protooPeer?.close()
    } catch {
    }
    protooPeer = null

    device = null;
  } catch (error) {
    console.error('[mediasoupClient] leaveRoom error', error);
    callbacks.onError?.(error)
  }
}

export function getState(): StateSnapshot {
  return {
    deviceLoaded: !!device,
    hasSendTransport: !!sendTransport,
    hasRecvTransport: !!recvTransport,
    producers: Array.from(producers.keys()),
    consumers: Array.from(consumers.keys()),
    remoteStreamsCount: remoteStreams.size,
  };
}

function setupTransportEvents(transport: SendTransportLike | RecvTransportLike, direction: Direction) {
  (transport as BaseTransport).on(
    'connect',
    async (
      {dtlsParameters}: { dtlsParameters: DtlsParameters },
      callback: () => void,
      errback: (e: unknown) => void,
    ) => {
      try {
        await tryRequest('connectWebRtcTransport', {
          transportId: transport.id,
          dtlsParameters,
        })
        callback()
      } catch (err) {
        console.error(`[mediasoupClient] ${direction} connect error`, err)
        errback(err)
      }
    },
  )

  if (direction === 'send') {
    (transport as SendTransportLike).on(
      'produce',
      async (
        {kind, rtpParameters}: { kind: TrackKind; rtpParameters: RtpParameters },
        callback: (res: { id: string }) => void,
        errback: (e: unknown) => void,
      ) => {
        try {
          const {id} = (await tryRequest('produce', {
            transportId: transport.id,
            kind,
            rtpParameters,
          })) as { id: string }
          callback({id})
        } catch (error) {
          console.error('[mediasoupClient] produce error', error)
          errback(error)
        }
      },
    )
  }

  (transport as BaseTransport).on('connectionstatechange', (state: string) => {
    callbacks.onConnectionStateChange?.({[direction]: state} as any)
  });
}

function attachProtooRequestHandlers() {
  if (!protooPeer) return

  protooPeer.on(
    'request',
    async (req: ProtooRequest, accept: () => void, reject: (e: unknown) => void) => {
      try {
        switch (req.method) {
          case 'newConsumer': {
            const {
              id: consumerId,
              producerId,
              kind,
              rtpParameters,
              appData,
            } = req.data as {
              id: string;
              producerId: string;
              kind: TrackKind;
              rtpParameters: RtpParameters;
              appData?: any;
            }

            if (!recvTransport) throw new Error('recvTransport not ready')

            const consumer = await recvTransport.consume({
              id: consumerId,
              producerId,
              kind,
              rtpParameters,
              appData,
            })

            consumers.set(consumerId, consumer)

            const stream = new MediaStream()
            stream.addTrack(consumer.track)
            remoteStreams.set(producerId, stream)
            emit('onRemoteStream', {producerId, stream, kind})

            accept()
            await resumeConsumer(consumerId)

            consumer.on('transportclose', () => {
              consumers.delete(consumerId)
              remoteStreams.delete(producerId)
              emit('onRemoteTrackEnded', {producerId, kind})
            })

            consumer.on('producerclose', () => {
              try {
                consumer.close()
              } catch {
              }
              consumers.delete(consumerId)
              remoteStreams.delete(producerId)
              emit('onRemoteTrackEnded', {producerId, kind})
            })

            break
          }

          case 'consumerClosed': {
            const {consumerId, producerId, kind} = (req.data || {}) as {
              consumerId?: string;
              producerId?: string;
              kind?: TrackKind;
            }

            if (consumerId) {
              const consumer = consumers.get(consumerId)
              try {
                consumer?.track?.stop?.()
              } catch {
              }
              try {
                consumer?.close?.()
              } catch {
              }
              consumers.delete(consumerId)
            }

            if (producerId) remoteStreams.delete(producerId)

            emit('onRemoteTrackEnded', {producerId, kind})
            accept()
            break
          }

          default:
            accept()
        }
      } catch (err) {
        console.error('[protoo][request] error', req.method, err)
        reject(err)
      }
    }
  );
}
