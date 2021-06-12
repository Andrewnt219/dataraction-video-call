import { useEffect } from 'react';
import { useAgoraDispatch } from '_context/AgoraContext';

export const useAgoraInit = () => {
  const dispatch = useAgoraDispatch();

  useEffect(() => {
    import('agora-rtc-sdk-ng')
      .then(({ default: AgoraRTC }) => {
        const agoraClient = AgoraRTC.createClient({
          codec: 'h264',
          mode: 'rtc',
        });

        dispatch({ type: 'INIT_CLIENT', payload: agoraClient });
        dispatch({ type: 'INIT_RTC', payload: AgoraRTC });
      })
      .catch((err) => console.log('Fail to load Agora'));
  }, [dispatch]);
};
