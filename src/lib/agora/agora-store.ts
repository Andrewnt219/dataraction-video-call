import type {
  IAgoraRTC,
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng';
import { ActionWithouPayload, ActionWithPayload, ErrorMessage } from '_common';

type State = {
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

  isLoading: false,
  error: null,
};

type Action =
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

    case 'CREATE_ROOM':
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

    case 'TOGGLE_AUDIO':
      return { ...state, isEnabledAudio: !state.isEnabledAudio };

    case 'TOGGLE_VIDEO':
      return { ...state, isEnabledVideo: !state.isEnabledVideo };

    case 'LEAVE_ROOM':
      return {
        ...state,
        token: null,
        channelName: undefined,
        remoteUsers: [],
        roomState: 'idle',
      };

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
