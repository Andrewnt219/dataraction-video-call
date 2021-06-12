import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAgoraContext } from '_lib/agora/AgoraContext';
import { useAgoraHandlers } from '_lib/agora/useAgoraHandlers';

export const useInvitationLink = () => {
  const state = useAgoraContext();
  const { joinRoom } = useAgoraHandlers();

  const {
    query: { token: tokenQuery, channelName: channelNameQuery },
  } = useRouter();

  const [invitation, setInvitation] = useState<string>('');

  useEffect(() => {
    if (
      state.token &&
      state.channelName &&
      state.localAudioTrack &&
      state.localVideoTrack
    ) {
      const invitationLink =
        window.location.origin +
        `?token=${encodeURIComponent(
          state.token
        )}&channelName=${encodeURIComponent(state.channelName)}`;

      setInvitation(invitationLink);
    } else {
      setInvitation('');
    }
  }, [
    state.token,
    state.localAudioTrack,
    state.localVideoTrack,
    state.channelName,
  ]);

  useEffect(() => {
    if (typeof tokenQuery !== 'string' || typeof channelNameQuery !== 'string')
      return;
    debugger;
    joinRoom({
      token: decodeURIComponent(tokenQuery),
      channelName: decodeURIComponent(channelNameQuery),
    });
  }, [channelNameQuery, joinRoom, tokenQuery]);

  return invitation;
};
