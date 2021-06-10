import { useAgoraContext } from '_context/AgoraContext';
import { useAgoraDevice } from '_lib/agora/useAgoraDevice';

export const useAgoraVideoSelect = () => {
  const agoraContext = useAgoraContext();

  const videoInput = useAgoraDevice({
    agoraRtc: agoraContext.agoraRtc,
    kind: 'videoinput',
  });

  return { agoraContext, videoInput };
};
