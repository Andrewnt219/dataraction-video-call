import { ITrack } from 'agora-rtc-sdk-ng';
import React, { useEffect, useRef, useState } from 'react';
import { isMicrophoneTrack } from '_lib/agora/agora-utils';

export interface VideoPlayerProps {
  videoTrack: ITrack | undefined;
  audioTrack: ITrack | undefined;
}

// TODO #10 display black screen on remote user mute
const AgoraVideoPlayer = ({ audioTrack, videoTrack }: VideoPlayerProps) => {
  const videoElementRef = useRef<HTMLDivElement>(null);
  const [volumeLevel, setVolumeLevel] = useState(0);

  useEffect(() => {
    if (!audioTrack || !isMicrophoneTrack(audioTrack)) return;

    const updateVolumeLevel = () => setVolumeLevel(audioTrack.getVolumeLevel());

    const timerId = setInterval(updateVolumeLevel, 450);

    return () => clearInterval(timerId);
  }, [audioTrack]);

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
    <div>
      <div
        ref={videoElementRef}
        className="video-player"
        style={{ width: '320px', height: '240px' }}
      ></div>

      <div style={{ width: '500px', background: 'grey' }}>
        <div
          aria-valuenow={volumeLevel}
          aria-valuemax={100}
          aria-valuemin={0}
          style={{
            height: 20,
            transition: 'width 0.6s ease',
            width: `${volumeLevel * 100}%`,
            background: 'red',
          }}
        ></div>
      </div>
    </div>
  );
};

export default AgoraVideoPlayer;
