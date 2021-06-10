import { ITrack } from 'agora-rtc-sdk-ng';
import React, { useEffect, useRef, useState } from 'react';

export interface VideoPlayerProps {
  videoTrack: ITrack | undefined;
  audioTrack: ITrack | undefined;
}

// TODO #10 display black screen on remote user mute
const AgoraVideoPlayer = ({ audioTrack, videoTrack }: VideoPlayerProps) => {
  const videoElementRef = useRef<HTMLDivElement>(null);
  const [volumeLevel, setVolumeLevel] = useState(0);

  // useEffect(() => {
  //   if (!audioTrack || !isMicrophoneTrack(audioTrack)) return;

  //   const updateVolumeLevel = () => setVolumeLevel(audioTrack.getVolumeLevel());

  //   const timerId = setInterval(updateVolumeLevel, 450);

  //   return () => clearInterval(timerId);
  // }, [audioTrack]);

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
    <div className="bg-gray-900">
      <div
        ref={videoElementRef}
        className="w-full h-60 max-w-xs mx-auto bg-black"
      ></div>
    </div>
  );
};

export default AgoraVideoPlayer;
