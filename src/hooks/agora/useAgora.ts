import { useAgoraHandlers } from './useAgoraHandlers';
import { useAgoraInit } from './useAgoraInit';

export default function useAgora() {
  useAgoraInit();

  const handlers = useAgoraHandlers();

  return { handlers };
}
