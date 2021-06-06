import { ClientConfig, IAgoraRTC, IAgoraRTCClient } from 'agora-rtc-sdk-ng';
import { useEffect, useState } from 'react';

export const useAgoraInit = (clientConfig?: ClientConfig) => {
  const [agoraRtc, setAgoraRtc] = useState<IAgoraRTC | null>(null);
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);

  useEffect(() => {
    import('agora-rtc-sdk-ng')
      .then(({ default: AgoraRTC }) => {
        const agoraClient = AgoraRTC.createClient({
          codec: 'h264',
          mode: 'rtc',
          ...clientConfig,
        });

        setAgoraRtc(AgoraRTC);
        setClient(agoraClient);
      })
      .catch((err) => console.log('Fail to load Agora'));
  }, []);

  return {
    agoraRtc,
    client,
  };
};
