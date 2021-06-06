import { ILocalAudioTrack, ILocalVideoTrack } from 'agora-rtc-sdk-ng';

// NOTE this is the only reliable way, reversing the logic may not work
export const isAudioMuted = (audioTrack: ILocalAudioTrack) => {
  // TODO need a more consitent result than this
  return Math.floor(audioTrack.getVolumeLevel() * 100) === 0;
};

export const isVideoMuted = (videoTrack: ILocalVideoTrack) => {
  return !videoTrack.isPlaying;
};
