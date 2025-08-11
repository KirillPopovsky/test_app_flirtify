import * as mediasoupClient from 'mediasoup-client';
import type {
  RtpCapabilities,
  RtpParameters,
  DtlsParameters,
  IceParameters,
  IceCandidate,
  Producer,
  Consumer,
  //@ts-ignore
} from 'mediasoup-client/lib/types';
import { mediaDevices, registerGlobals, MediaStream, MediaStreamTrack } from 'react-native-webrtc';
import * as protoo from 'protoo-client';
import RTCRtpEncodingParameters from 'react-native-webrtc/lib/typescript/RTCRtpEncodingParameters';

registerGlobals();

export type TrackKind = 'audio' | 'video';

export interface ConnectOptions {
  wsUrl: string;
  roomId?: string;
  peerId: string;
  callbacks?: Callbacks;
}

export interface Callbacks {
  onNotification?: (n: ProtooNotification) => void;
  onRemoteStream?: (payload: { producerId: string; stream: MediaStream; kind: TrackKind }) => void;
  onRemoteTrackEnded?: (payload: { producerId?: string; kind?: TrackKind }) => void;
  onConnectionStateChange?: (state: { send?: string; recv?: string }) => void;
  onError?: (error: unknown) => void;
}

export interface ProtooNotification {
  method: string;
  data?: any;
}

export interface ProtooRequest {
  method: string;
  data?: any;
}

export interface BaseTransport {
  id: string;
  close: () => void;
  on: (event: 'connect' | 'connectionstatechange' | 'produce', ...args: any[]) => void;
}

export interface SendTransportLike extends BaseTransport {
  //TODO: fix types

  // on: (
  //   event: 'connect',
  //   handler: (
  //     args: { dtlsParameters: DtlsParameters },
  //     callback: () => void,
  //     errback: (error: any) => void,
  //   ) => void,
  // ) => void;
  // on: (
  //   event: 'produce',
  //   handler: (
  //     args: { kind: TrackKind; rtpParameters: RtpParameters; appData?: any },
  //     callback: (res: { id: string }) => void,
  //     errback: (error: any) => void,
  //   ) => void,
  // ) => void;
  // on: (event: 'connectionstatechange', handler: (state: string) => void) => void;
  produce: (opts: { track: MediaStreamTrack; appData?: any; encodings?: RTCRtpEncodingParameters[] }) => Promise<Producer>;
}

export interface RecvTransportLike extends BaseTransport {
  // on: (
  //   event: 'connect',
  //   handler: (
  //     args: { dtlsParameters: DtlsParameters },
  //     callback: () => void,
  //     errback: (error: any) => void,
  //   ) => void,
  // ) => void;
  // on: (event: 'connectionstatechange', handler: (state: string) => void) => void;
  consume: (opts: { id: string; producerId: string; kind: TrackKind; rtpParameters: RtpParameters; appData?: any }) => Promise<Consumer>;
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

const producers: Map<TrackKind, Producer> = new Map();
const consumers: Map<string, Consumer> = new Map();
const remoteStreams: Map<string, MediaStream> = new Map();
let localStream: MediaStream | null = null;

let cb: Callbacks = {};

function emit<K extends keyof Callbacks>(name: K, payload: Parameters<NonNullable<Callbacks[K]>>[0]) {
  try {
    const fn = cb[name] as any;
    if (typeof fn === 'function') fn(payload);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`[mediasoupClient] callback ${String(name)} threw`, err);
  }
}

export async function connectToRoom({ wsUrl, roomId, peerId, callbacks = {} }: ConnectOptions): Promise<boolean> {
  cb = { ...cb, ...callbacks };

  const transport = new protoo.WebSocketTransport(wsUrl);
  protooPeer = new protoo.Peer(transport);

  return new Promise<boolean>((resolve, reject) => {
    protooPeer!.on('open', async () => {
      try {
        const routerRtpCapabilities: RtpCapabilities = await protooPeer!.request('getRouterRtpCapabilities');
        device = new mediasoupClient.Device();
        await device.load({ routerRtpCapabilities });

        {
          const t: {
            id: string;
            iceParameters: IceParameters;
            iceCandidates: IceCandidate[];
            dtlsParameters: DtlsParameters;
          } = await protooPeer!.request('createWebRtcTransport', { producing: true, consuming: false });

          const st = device!.createSendTransport({
            id: t.id,
            iceParameters: t.iceParameters,
            iceCandidates: t.iceCandidates,
            dtlsParameters: t.dtlsParameters,
            iceServers: [],
          }) as unknown as SendTransportLike;
          sendTransport = st;
          setupTransportEvents(sendTransport, 'send');
        }

        {
          const t: {
            id: string;
            iceParameters: IceParameters;
            iceCandidates: IceCandidate[];
            dtlsParameters: DtlsParameters;
          } = await protooPeer!.request('createWebRtcTransport', { producing: false, consuming: true });

          const rt = device!.createRecvTransport({
            id: t.id,
            iceParameters: t.iceParameters,
            iceCandidates: t.iceCandidates,
            dtlsParameters: t.dtlsParameters,
            iceServers: [],
          }) as unknown as RecvTransportLike;
          recvTransport = rt;
          setupTransportEvents(recvTransport, 'recv');
        }

        attachProtooRequestHandlers();

        await protooPeer!.request('join', {
          roomId,
          displayName: peerId,
          device: { name: 'React Native' },
          rtpCapabilities: device!.rtpCapabilities,
        });

        protooPeer!.on('notification', (n: ProtooNotification) => {
          emit('onNotification', n);
          switch (n.method) {
            case 'producerClosed': {
              const { producerId, kind } = (n.data || {}) as { producerId?: string; kind?: TrackKind };
              for (const [consumerId, consumer] of consumers) {
                if ((consumer as any).producerId === producerId) {
                  try { (consumer as any).track?.stop?.(); consumer.close(); } catch {}
                  consumers.delete(consumerId);
                }
              }
              if (producerId && remoteStreams.has(producerId)) {
                const s = remoteStreams.get(producerId)!;
                try { s.getTracks().forEach(t => t.stop()); } catch {}
                remoteStreams.delete(producerId);
                emit('onRemoteTrackEnded', { producerId, kind });
              }
              break;
            }
            default:
              break;
          }
        });

        resolve(true);
      } catch (err) {
        console.error('[mediasoupClient] connect error', err);
        cb.onError?.(err);
        reject(err);
      }
    });

    protooPeer!.on('failed', () => {
      const err = new Error('Protoo connection failed');
      cb.onError?.(err);
      reject(err);
    });
  });
}

export async function startSendingVideo({ withAudio = true }: { withAudio?: boolean } = {}): Promise<MediaStream> {
  if (!sendTransport) throw new Error('sendTransport not ready');
  localStream = await mediaDevices.getUserMedia({ video: true, audio: !!withAudio });
  const videoTrack = localStream.getVideoTracks?.()[0];
  const audioTrack = withAudio ? localStream.getAudioTracks?.()[0] : null;

  if (videoTrack) {
    const vp = await sendTransport.produce({ track: videoTrack });
    producers.set('video', vp);
  }
  if (audioTrack) {
    const ap = await sendTransport.produce({ track: audioTrack });
    producers.set('audio', ap);
  }
  return localStream;
}

export async function stopSendingVideo(): Promise<void> {
  for (const [, producer] of producers) {
    try { (producer as any).track?.stop?.(); producer.close(); } catch {}
  }
  producers.clear();
  if (localStream) {
    try { localStream.getTracks().forEach(t => t.stop()); } catch {}
    localStream = null;
  }
}

export async function leaveRoom(): Promise<void> {
  try {
    await stopSendingVideo();

    for (const [, consumer] of consumers) {
      try { (consumer as any).track?.stop?.(); consumer.close(); } catch {}
    }
    consumers.clear();

    if (recvTransport) { try { recvTransport.close(); } catch {} recvTransport = null; }
    if (sendTransport) { try { sendTransport.close(); } catch {} sendTransport = null; }

    try { await protooPeer?.request('leave'); } catch {}

    if (protooPeer) { try { protooPeer.close(); } catch {} protooPeer = null; }

    device = null;
  } catch (err) {
    console.error('[mediasoupClient] leaveRoom error', err);
    cb.onError?.(err);
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

function setupTransportEvents(transport: SendTransportLike | RecvTransportLike, direction: 'send' | 'recv') {
  transport.on('connect', async ({ dtlsParameters }: { dtlsParameters: DtlsParameters }, callback: () => void, errback: (e: any) => void) => {
    try {
      await protooPeer!.request('connectWebRtcTransport', {
        transportId: transport.id,
        dtlsParameters,
      });
      callback();
    } catch (err) {
      console.error(`[mediasoupClient] ${direction} connect error`, err);
      errback(err);
    }
  });

  if (direction === 'send') {
    (transport as SendTransportLike).on('produce', async (
      { kind, rtpParameters }: { kind: TrackKind; rtpParameters: RtpParameters },
      callback: (res: { id: string }) => void,
      errback: (e: any) => void,
    ) => {
      try {
        const { id } = await protooPeer!.request('produce', {
          transportId: transport.id,
          kind,
          rtpParameters,
        });
        callback({ id });
      } catch (err) {
        console.error('[mediasoupClient] produce error', err);
        errback(err);
      }
    });
  }

  transport.on('connectionstatechange', (state: string) => {
    cb.onConnectionStateChange?.({ [direction]: state } as any);
  });
}

function attachProtooRequestHandlers() {
  protooPeer!.on('request', async (req: ProtooRequest, accept: () => void, reject: (e: any) => void) => {
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
          };

          if (!recvTransport) throw new Error('recvTransport not ready');

          const consumer = await recvTransport.consume({
            id: consumerId,
            producerId,
            kind,
            rtpParameters,
            appData,
          });
          consumers.set(consumerId, consumer);

          const stream = new MediaStream();
          stream.addTrack((consumer as any).track);
          remoteStreams.set(producerId, stream);
          emit('onRemoteStream', { producerId, stream, kind });

          accept();

          try {
            await protooPeer!.request('resumeConsumer', { consumerId });
          } catch {
            await protooPeer!.request('consumerResume', { consumerId }).catch(() => {});
          }

          consumer.on('transportclose' as any, () => {
            consumers.delete(consumerId);
            remoteStreams.delete(producerId);
            emit('onRemoteTrackEnded', { producerId, kind });
          });

          consumer.on('producerclose' as any, () => {
            try { (consumer as any).close(); } catch {}
            consumers.delete(consumerId);
            remoteStreams.delete(producerId);
            emit('onRemoteTrackEnded', { producerId, kind });
          });

          break;
        }

        case 'consumerClosed': {
          const { consumerId, producerId, kind } = (req.data || {}) as { consumerId?: string; producerId?: string; kind?: TrackKind };
          if (consumerId) {
            const consumer = consumers.get(consumerId);
            try { (consumer as any)?.track?.stop?.(); (consumer as any)?.close?.(); } catch {}
            consumers.delete(consumerId);
          }
          if (producerId) remoteStreams.delete(producerId);
          emit('onRemoteTrackEnded', { producerId, kind });
          accept();
          break;
        }

        default:
          accept();
      }
    } catch (err) {
      console.error('[protoo][request] error', req.method, err);
      reject(err);
    }
  });
}
