import type { ClientConfig } from 'agora-rtc-sdk-ng';
import { useAgoraHandlers } from './useAgoraHandlers';
import { useAgoraInit } from './useAgoraInit';

export default function useAgora(clientConfig?: ClientConfig) {
  const { agoraRtc, client } = useAgoraInit(clientConfig);

  // const [joinState, setJoinState] = useState<ReturnType['joinState']>('idle');
  const handlers = useAgoraHandlers(client, agoraRtc);

  return { handlers, client };
}
