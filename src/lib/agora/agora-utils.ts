import type {
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  ITrack,
} from 'agora-rtc-sdk-ng';

export const isMediaTrack = (
  track: ITrack
): track is ICameraVideoTrack | IMicrophoneAudioTrack => {
  return 'setDevice' in track;
};

export const isCameraTrack = (track: ITrack): track is ICameraVideoTrack => {
  return isMediaTrack(track) && track.trackMediaType === 'video';
};

export const isMicrophoneTrack = (
  track: ITrack
): track is IMicrophoneAudioTrack => {
  return isMediaTrack(track) && track.trackMediaType === 'audio';
};
