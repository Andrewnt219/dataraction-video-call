import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAgoraHandlers } from '_lib/agora/useAgoraHandlers';

/**
 * @description handle joining room base on invitation link
 */
export const useInvitationLinkReader = () => {
  const { joinRoom } = useAgoraHandlers();

  const {
    query: { token: tokenQuery, channelName: channelNameQuery },
  } = useRouter();

  useEffect(() => {
    if (typeof tokenQuery !== 'string' || typeof channelNameQuery !== 'string')
      return;

    joinRoom({
      token: decodeURIComponent(tokenQuery),
      channelName: decodeURIComponent(channelNameQuery),
    });
  }, [channelNameQuery, joinRoom, tokenQuery]);
};
