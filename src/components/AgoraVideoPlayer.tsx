import type {
  ILocalAudioTrack,
  ILocalVideoTrack,
  IRemoteAudioTrack,
  IRemoteVideoTrack,
} from 'agora-rtc-sdk-ng';
import React, { useEffect, useRef } from 'react';

export interface VideoPlayerProps {
  videoTrack: ILocalVideoTrack | IRemoteVideoTrack | undefined;
  audioTrack: ILocalAudioTrack | IRemoteAudioTrack | undefined;
}

const AgoraVideoPlayer = ({ audioTrack, videoTrack }: VideoPlayerProps) => {
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

  return (
    <div
      ref={videoElementRef}
      className="video-player"
      style={{ width: '320px', height: '240px' }}
    ></div>
  );
};

export default AgoraVideoPlayer;
