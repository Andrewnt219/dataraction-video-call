import type {
  CameraVideoTrackInitConfig,
  MicrophoneAudioTrackInitConfig,
} from 'agora-rtc-sdk-ng';
import axios from 'axios';
import { useCallback } from 'react';
import { useAlertContext } from '_context/AlertContext';
import { NEXT_PUBLIC_AGORA_APP_ID } from '_lib/agora/agora-constants';
import { useAgoraContext, useAgoraDispatch } from '_lib/agora/AgoraContext';
import type * as ApiAgoraGetRoomToken from '_pages/api/agora/getRoomToken';
import { getErrorMessage } from '_utils/convert-utils';

/**
 * @description All the methods to sync agora-sdk with agora-store
 */
export const useAgoraHandlers = () => {
  const { trigger } = useAlertContext();

  const state = useAgoraContext();
  const dispatch = useAgoraDispatch();

  /* Handle error from agora-sdk */
  const handleError = useCallback(
    (err: Error) => {
      let message = '';

      if (err instanceof Error) message = err.message;
      else message = getErrorMessage(err).message;

      trigger('danger', message);
      dispatch({ type: 'ERROR', payload: { message } });
    },
    [dispatch, trigger]
  );

  /* Initialize camera and microphone tracks in store  */
  const createLocalVideoAndAudioTrack = useCallback(
    async (config?: TrackConfig): Promise<void> => {
      const agoraRtc = state.agoraRtc;
      if (!agoraRtc) throw new Error('Agora service is not available');

      try {
        const [audioTrack, cameraTrack] =
          await agoraRtc.createMicrophoneAndCameraTracks(
            config?.audio,
            config?.video
          );

        dispatch({
          type: 'INIT_TRACKS',
          payload: { audio: audioTrack, video: cameraTrack },
        });
      } catch (error) {
        handleError(error);
      }
    },
    [dispatch, handleError, state.agoraRtc]
  );

  /* Join an existing room */
  const joinRoom: JoinRoom = useCallback(
    async ({ channelName, token, uid }) => {
      const agoraRtc = state.agoraRtc;
      const client = state.client;

      if (!agoraRtc || !client) return;

      try {
        // In case user has left room before
        await createLocalVideoAndAudioTrack();

        await client
          .join(NEXT_PUBLIC_AGORA_APP_ID, channelName, token, uid)
          .catch(handleError);

        dispatch({ type: 'JOIN_ROOM', payload: { channelName, token } });
        trigger('info', 'Joined room');
      } catch (error) {
        handleError(error);
      }
    },
    [
      createLocalVideoAndAudioTrack,
      dispatch,
      handleError,
      state.agoraRtc,
      state.client,
      trigger,
    ]
  );

  /* Create a new room with server token */
  const createRoom: CreateRoomHandler = useCallback(
    async (params) => {
      const client = state.client;
      if (!client) return;
      await createLocalVideoAndAudioTrack();

      try {
        const {
          data: { data },
        } = await axios.get<ApiAgoraGetRoomToken.Data>(
          '/api/agora/getRoomToken',
          {
            params,
          }
        );

        const roomOptions: RoomOptions = {
          channelName: data.channelName,
          token: data.token,
          uid: params.userUid?.toString(),
        };

        trigger('info', 'Created room');

        await joinRoom(roomOptions);
      } catch (err) {
        handleError(err);
      }
    },
    [
      createLocalVideoAndAudioTrack,
      handleError,
      joinRoom,
      state.client,
      trigger,
    ]
  );

  /* Publish all current tracks */
  const publishTracks: PublishTracksHandler = useCallback(async () => {
    const client = state.client;
    if (!client) return;

    if (state.localAudioTrack) {
      await client.publish(state.localAudioTrack).catch(handleError);
    }

    if (state.localVideoTrack) {
      await client.publish(state.localVideoTrack).catch(handleError);
    }

    dispatch({ type: 'PUBLISH_TRACKS' });
    trigger('info', 'Went live!');
  }, [
    dispatch,
    handleError,
    state.client,
    state.localAudioTrack,
    state.localVideoTrack,
    trigger,
  ]);

  /* Unpublish a track */
  const unpublishTracks: UnpublishTracksHandler = useCallback(
    async (trackType) => {
      const client = state.client;
      if (!client) return;

      try {
        switch (trackType) {
          case '*':
            if (state.localAudioTrack) {
              await client.unpublish(state.localAudioTrack);
              dispatch({ type: 'UNPUBLISH_AUDIO_INPUT' });
            }

            if (state.localVideoTrack) {
              await client.unpublish(state.localVideoTrack);
              dispatch({ type: 'UNPUBLISH_VIDEO_INPUT' });
            }

            break;

          case 'audio':
            if (state.localAudioTrack) {
              await client.unpublish(state.localAudioTrack);
              dispatch({ type: 'UNPUBLISH_AUDIO_INPUT' });
            }

            break;

          case 'video':
            if (state.localVideoTrack) {
              await client.unpublish(state.localVideoTrack);
              dispatch({ type: 'UNPUBLISH_VIDEO_INPUT' });
            }

            break;

          default:
            throw new Error('Invalid track type');
        }

        trigger('info', 'Unpublished');
      } catch (error) {
        handleError(error);
      }
    },
    [
      dispatch,
      handleError,
      state.client,
      state.localAudioTrack,
      state.localVideoTrack,
      trigger,
    ]
  );

  /* Toggle mute for audio input */
  const toggleAudio = useCallback(() => {
    dispatch({ type: 'TOGGLE_AUDIO' });
    return;
  }, [dispatch]);

  /* Toggle mute for audio output */
  const toggleVideo = useCallback(() => {
    dispatch({ type: 'TOGGLE_VIDEO' });
  }, [dispatch]);

  /* Leave a room and reset room's state */
  const leave: LeaveHandler = useCallback(async () => {
    const client = state.client;
    if (!client) return;

    try {
      await client?.leave();

      dispatch({ type: 'LEAVE_ROOM' });
      trigger('info', 'Left room');
    } catch (error) {
      handleError(error);
    }
  }, [dispatch, handleError, state.client, trigger]);

  return {
    state,
    createRoom,
    leave,
    publishTracks,
    toggleAudio,
    toggleVideo,
    joinRoom,
    unpublishTracks,
  };
};

type RoomOptions = {
  channelName: string;
  token: string;
  uid?: string;
};

type TrackType = 'video' | 'audio' | '*';
type TrackConfig = {
  audio?: MicrophoneAudioTrackInitConfig;
  video?: CameraVideoTrackInitConfig;
};
type CreateRoomHandler = (params: ApiAgoraGetRoomToken.Query) => Promise<void>;
type PublishTracksHandler = () => Promise<void>;
type UnpublishTracksHandler = (track: TrackType) => Promise<void>;
type JoinRoom = (options: RoomOptions) => Promise<void>;
type LeaveHandler = () => Promise<void>;
