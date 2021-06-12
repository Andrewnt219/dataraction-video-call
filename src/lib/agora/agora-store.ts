import type {
  IAgoraRTC,
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng';
import { ActionWithouPayload, ActionWithPayload, ErrorMessage } from '_common';
import { isCameraTrack, isMicrophoneTrack } from './agora-utils';

const emptyDevices: AudioInputDevices & AudioOutputDevices & VideoInputDevices =
  {
    devices: [],
    track: undefined,
    selectedDevice: null,
  };
export type State = {
  agoraRtc: IAgoraRTC | null;
  client: IAgoraRTCClient | null;

  localVideoTrack: ICameraVideoTrack | undefined;
  localAudioTrack: IMicrophoneAudioTrack | undefined;
  isEnabledVideo: boolean;
  isEnabledAudio: boolean;

  token: string | null;
  channelName: string | undefined;
  remoteUsers: IAgoraRTCRemoteUser[];
  roomState: RoomState;

  audioinput: AudioInputDevices;
  audiooutput: AudioOutputDevices;
  videoinput: VideoInputDevices;

  isLoading: boolean;
  error: ErrorMessage | null;
};
export const initialState: State = {
  agoraRtc: null,
  client: null,

  localAudioTrack: undefined,
  localVideoTrack: undefined,
  isEnabledAudio: true,
  isEnabledVideo: true,

  token: null,
  channelName: undefined,
  remoteUsers: [],
  roomState: 'idle',

  audioinput: { ...emptyDevices },
  audiooutput: { ...emptyDevices },
  videoinput: { ...emptyDevices },

  isLoading: false,
  error: null,
};

export type Action =
  | ActionWithPayload<'INIT_RTC', IAgoraRTC>
  | ActionWithPayload<'INIT_CLIENT', IAgoraRTCClient>
  | ActionWithPayload<
      'INIT_TRACKS',
      { audio: IMicrophoneAudioTrack; video: ICameraVideoTrack }
    >
  | ActionWithPayload<'SET_AUDIO_TRACK', IMicrophoneAudioTrack>
  | ActionWithPayload<'SET_VIDEO_TRACK', ICameraVideoTrack>
  | ActionWithPayload<'JOIN_ROOM', { channelName: string; token: string }>
  | ActionWithPayload<'CREATE_ROOM', { channelName: string; token: string }>
  | ActionWithPayload<'SET_REMOTE_USER', IAgoraRTCRemoteUser[]>
  | ActionWithouPayload<'PUBLISH_TRACKS'>
  | ActionWithouPayload<'UNPUBLISH_TRACKS'>
  | ActionWithouPayload<'UNPUBLISH_AUDIO_INPUT'>
  | ActionWithouPayload<'UNPUBLISH_VIDEO_INPUT'>
  | ActionWithouPayload<'TOGGLE_AUDIO'>
  | ActionWithouPayload<'TOGGLE_VIDEO'>
  | ActionWithouPayload<'LEAVE_ROOM'>
  | ActionWithPayload<'SET_DEVICE', { deviceId: string; kind: MediaDeviceKind }>
  | ActionWithPayload<
      'INIT_DEVICES',
      {
        devices: MediaDeviceInfo[];
        kind: MediaDeviceKind;
        track: IMicrophoneAudioTrack | ICameraVideoTrack;
      }
    >
  | ActionWithouPayload<'START_LOADING'>
  | ActionWithouPayload<'STOP_LOADING'>
  | ActionWithPayload<'ERROR', ErrorMessage>;

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'INIT_CLIENT':
      return { ...state, client: action.payload };

    case 'INIT_RTC':
      return { ...state, agoraRtc: action.payload };

    case 'SET_AUDIO_TRACK':
      return { ...state, localAudioTrack: action.payload };

    case 'SET_VIDEO_TRACK':
      return { ...state, localVideoTrack: action.payload };

    case 'INIT_TRACKS':
      return {
        ...state,
        localAudioTrack: action.payload.audio,
        localVideoTrack: action.payload.video,
      };

    case 'JOIN_ROOM':
      return {
        ...state,
        roomState: 'ready',
        channelName: action.payload.channelName,
        token: action.payload.token,
      };

    case 'SET_REMOTE_USER':
      return {
        ...state,
        remoteUsers: action.payload,
      };

    case 'PUBLISH_TRACKS':
      return { ...state, roomState: 'live' };

    case 'UNPUBLISH_TRACKS':
      return {
        ...state,
        localAudioTrack: undefined,
        localVideoTrack: undefined,
        roomState: 'ready',
      };

    case 'UNPUBLISH_AUDIO_INPUT':
      return {
        ...state,
        localAudioTrack: undefined,
        roomState: 'ready',
      };

    case 'UNPUBLISH_VIDEO_INPUT':
      return {
        ...state,
        localVideoTrack: undefined,
        roomState: 'ready',
      };

    case 'TOGGLE_AUDIO': {
      const { localAudioTrack } = state;

      if (!localAudioTrack) return state;

      localAudioTrack.setEnabled(!state.isEnabledAudio);
      return {
        ...state,
        localAudioTrack,
        isEnabledAudio: !state.isEnabledAudio,
      };
    }

    case 'TOGGLE_VIDEO': {
      const { localVideoTrack } = state;

      if (!localVideoTrack) return state;

      localVideoTrack.setEnabled(!state.isEnabledAudio);
      return {
        ...state,
        localVideoTrack,
        isEnabledVideo: !state.isEnabledVideo,
      };
    }

    case 'LEAVE_ROOM': {
      const { localAudioTrack, localVideoTrack } = state;

      if (localAudioTrack) {
        localAudioTrack.stop();
        localAudioTrack.close();
      }

      if (localVideoTrack) {
        localVideoTrack.stop();
        localVideoTrack.close();
      }

      return {
        ...state,
        localAudioTrack,
        localVideoTrack,
        token: null,
        channelName: undefined,
        remoteUsers: [],
        roomState: 'idle',
      };
    }

    case 'INIT_DEVICES': {
      const { devices, kind, track } = action.payload;

      switch (kind) {
        case 'audioinput': {
          return {
            ...state,
            [kind]: {
              devices,
              track: isMicrophoneTrack(track) ? track : undefined,
              selectedDevice: devices[0],
            },
          };
        }

        case 'audiooutput': {
          return {
            ...state,
            [kind]: {
              devices,
              track: isMicrophoneTrack(track) ? track : undefined,
              selectedDevice: devices[0],
            },
          };
        }

        case 'videoinput': {
          return {
            ...state,
            [kind]: {
              devices,
              track: isCameraTrack(track) ? track : undefined,
              selectedDevice: devices[0],
            },
          };
        }

        default:
          throw new Error("Invalid device's kind");
      }
    }

    case 'SET_DEVICE': {
      const { kind, deviceId } = action.payload;

      // NOTE This switch is purely for type-safety of returned State ([kind])
      switch (kind) {
        case 'audioinput': {
          const mediaDevices = { ...state[kind] };
          if (!mediaDevices || !mediaDevices.track) return state;

          const device = mediaDevices.devices.filter(
            (d) => d.deviceId === deviceId
          )[0];

          if (!device) return state;

          mediaDevices.track.setDevice(deviceId);

          return {
            ...state,
            [kind]: {
              ...mediaDevices,
              selectedDevice: device,
            },
          };
        }

        case 'audiooutput': {
          const mediaDevices = { ...state[kind] };
          if (!mediaDevices || !mediaDevices.track) return state;

          const device = mediaDevices.devices.filter(
            (d) => d.deviceId === deviceId
          )[0];

          if (!device) return state;

          mediaDevices.track.setDevice(deviceId);

          return {
            ...state,
            [kind]: {
              ...mediaDevices,
              selectedDevice: device,
            },
          };
        }

        case 'videoinput': {
          const mediaDevices = { ...state[kind] };
          if (!mediaDevices || !mediaDevices.track) return state;

          const device = mediaDevices.devices.filter(
            (d) => d.deviceId === deviceId
          )[0];

          if (!device) return state;

          mediaDevices.track.setDevice(deviceId);

          return {
            ...state,
            [kind]: {
              ...mediaDevices,
              selectedDevice: device,
            },
          };
        }

        default:
          throw new Error("Invalid device's kind");
      }
    }

    case 'START_LOADING':
      return { ...state, isLoading: true, error: null };

    case 'STOP_LOADING':
      return { ...state, isLoading: false };

    case 'ERROR':
      return { ...state, isLoading: false, error: action.payload };

    default:
      throw new Error('Invalid action');
  }
};

type RoomState = 'idle' | 'ready' | 'live' | 'error';

type AudioInputDevices = {
  devices: MediaDeviceInfo[];
  track: IMicrophoneAudioTrack | undefined;
  selectedDevice: MediaDeviceInfo | null;
};

type AudioOutputDevices = {
  devices: MediaDeviceInfo[];
  track: IMicrophoneAudioTrack | undefined;
  selectedDevice: MediaDeviceInfo | null;
};

type VideoInputDevices = {
  devices: MediaDeviceInfo[];
  track: ICameraVideoTrack | undefined;
  selectedDevice: MediaDeviceInfo | null;
};
