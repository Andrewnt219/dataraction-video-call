import { useEffect, useState } from 'react';
import { useAgoraContext } from '_context/AgoraContext';
import { isMicrophoneTrack } from '_lib/agora/agora-utils';
import { useAgoraDevice } from '_lib/agora/useAgoraDevice';

export const useAgoraAudioSelect = (hidePreview = false) => {
  const agoraContext = useAgoraContext();

  const audioInput = useAgoraDevice({
    agoraRtc: agoraContext.agoraRtc,
    kind: 'audioinput',
  });

  const [volumeLevel, setVolumeLevel] = useState(0);

  useEffect(() => {
    const track = audioInput.track;
    if (!track || !isMicrophoneTrack(track)) return;

    const updateVolumeLevel = () => setVolumeLevel(track.getVolumeLevel());
    const timerId = setInterval(updateVolumeLevel, 450);

    return () => clearInterval(timerId);
  }, [audioInput.track]);

  useEffect(() => {
    const track = audioInput.track;
    if (hidePreview || !track || !isMicrophoneTrack(track)) return;

    track.play();

    return () => {
      track.stop();
    };
  }, [audioInput.track, hidePreview]);

  return { audioInput, volumeLevel, agoraContext };
};
