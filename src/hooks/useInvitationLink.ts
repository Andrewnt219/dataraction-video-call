import { useEffect, useState } from 'react';
import { useAgoraContext } from '_lib/agora/AgoraContext';

/**
 * @description handle creating link to room
 */
export const useInvitationLinkWriter = () => {
  const state = useAgoraContext();

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

  return invitation;
};
