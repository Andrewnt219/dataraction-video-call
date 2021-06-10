import { ITrack } from 'agora-rtc-sdk-ng';
import { useEffect, useRef } from 'react';

export const useAgoraVideoPlayer = (
  audioTrack: ITrack | undefined,
  videoTrack: ITrack | undefined
) => {
  const videoElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { current: videoElement } = videoElementRef;
    if (!videoElement || !videoTrack) return;

    videoTrack.play(videoElement);

    return () => {
      videoTrack?.stop();
    };
  }, [videoElementRef, videoTrack]);

  useEffect(() => {
    audioTrack?.play();

    return () => {
      audioTrack?.stop();
    };
  }, [audioTrack]);

  return videoElementRef;
};
