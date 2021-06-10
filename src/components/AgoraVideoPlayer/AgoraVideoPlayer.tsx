import { ITrack } from 'agora-rtc-sdk-ng';
import clsx from 'clsx';
import React from 'react';
import { useAgoraVideoPlayer } from './useAgoraVideoPlayer';

type Props = {
  videoTrack: ITrack | undefined;
  audioTrack: ITrack | undefined;
  className?: string;
};

const AgoraVideoPlayer = ({ audioTrack, videoTrack, className }: Props) => {
  const videoElementRef = useAgoraVideoPlayer(audioTrack, videoTrack);

  return (
    <div className={clsx('bg-gray-900 mt-2', className)}>
      <div
        ref={videoElementRef}
        className="w-full h-60 max-w-xs mx-auto bg-black"
      ></div>
    </div>
  );
};

export default AgoraVideoPlayer;
