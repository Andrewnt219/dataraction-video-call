import { useEffect, useState } from 'react';
import { useAgoraContext } from '_context/AgoraContext';
import { useAgoraDevice } from '_lib/agora/useAgoraDevice';

export const useAgoraAudioSelect = (hidePreview = false) => {
  const state = useAgoraContext();

  useAgoraDevice({
    kind: 'audioinput',
  });

  const [volumeLevel, setVolumeLevel] = useState(0);

  useEffect(() => {
    const track = state.audioinput.track;
    if (!track) return;

    const updateVolumeLevel = () => setVolumeLevel(track.getVolumeLevel());
    const timerId = setInterval(updateVolumeLevel, 450);

    return () => clearInterval(timerId);
  }, [state.audioinput.track]);

  useEffect(() => {
    const track = state.audioinput.track;
    if (hidePreview || !track) return;

    track.play();

    return () => {
      track.stop();
    };
  }, [hidePreview, state.audioinput.track]);

  return { volumeLevel };
};
