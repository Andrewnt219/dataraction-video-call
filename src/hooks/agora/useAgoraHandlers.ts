import type {
  CameraVideoTrackInitConfig,
  IAgoraRTC,
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  MicrophoneAudioTrackInitConfig,
} from 'agora-rtc-sdk-ng';
import axios from 'axios';
import { NEXT_PUBLIC_AGORA_APP_ID } from 'constants/agora';
import { useCallback, useEffect, useState } from 'react';
import { useAlertContext } from '_context/AlertContext';
import type * as ApiAgoraGetRoomToken from '_pages/api/agora/getRoomToken';
import { getErrorMessage } from '_utils/convert-utils';

export const useAgoraHandlers = (
  client: IAgoraRTCClient | null,
  agoraRtc: IAgoraRTC | null
) => {
  const { trigger } = useAlertContext();

  const [roomState, setRoomState] = useState<RoomState>('idle');

  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack>();
  const [localAudioTrack, setLocalAudioTrack] =
    useState<IMicrophoneAudioTrack>();

  // TODO #13 make the state the source of truth for mute
  // don't rely on getMediaStream().enabled
  const [isEnabledVideo, setIsEnabledVideo] = useState(
    localVideoTrack?.getMediaStreamTrack().enabled ?? true
  );
  const [isEnabledAudio, setIsEnabledAudio] = useState(
    localAudioTrack?.getMediaStreamTrack().enabled ?? true
  );

  const [token, setToken] = useState<string | null>(null);
  const [channel, setChannel] = useState<string>('');
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);

  const handleError = useCallback(
    (err: Error) => {
      let message = '';

      if (err instanceof Error) message = err.message;
      else message = getErrorMessage(err).message;

      trigger('danger', message);
    },
    [trigger]
  );

  // Ask for both video and microphone permission
  const createLocalVideoAndAudioTrack = useCallback(
    async (config?: TrackConfig): Promise<void> => {
      if (!agoraRtc) throw new Error('Agora service is not available');

      try {
        const [audioTrack, cameraTrack] =
          await agoraRtc.createMicrophoneAndCameraTracks(
            config?.audio,
            config?.video
          );

        setLocalVideoTrack(cameraTrack);
        setLocalAudioTrack(audioTrack);
      } catch (error) {
        handleError(error);
      }
    },
    [agoraRtc, handleError]
  );

  // join an existing room
  const joinRoom: JoinRoom = useCallback(
    async ({ channelName, token, uid }) => {
      if (!agoraRtc || !client) return;

      // In case user has left room before
      await createLocalVideoAndAudioTrack();

      await client
        ?.join(NEXT_PUBLIC_AGORA_APP_ID, channelName, token, uid)
        .catch(handleError);

      setRoomState('ready');
      setChannel(channelName);
      setToken(token);
    },
    [agoraRtc, client, createLocalVideoAndAudioTrack, handleError]
  );

  // Create a new room with token
  const createRoom: CreateRoomHandler = useCallback(
    async (params) => {
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
        await joinRoom(roomOptions);

        setToken(data.token);
        setChannel(data.channelName);
        setRoomState('ready');
      } catch (err) {
        handleError(err);
      }
    },
    [client, createLocalVideoAndAudioTrack, handleError, joinRoom]
  );

  // Publish a local track
  const publishTracks: PublishTracksHandler = useCallback(async () => {
    if (!client) return;

    if (localAudioTrack) {
      await client.publish(localAudioTrack).catch(handleError);
    }

    if (localVideoTrack) {
      await client.publish(localVideoTrack).catch(handleError);
    }

    setRoomState('live');
  }, [client, handleError, localAudioTrack, localVideoTrack]);

  // Unpublish a local track
  const unpublishTracks: UnpublishTracksHandler = useCallback(
    async (trackType) => {
      if (!client) return;

      try {
        switch (trackType) {
          case '*':
            if (localAudioTrack) {
              await client.unpublish(localAudioTrack);
              setLocalAudioTrack(undefined);
            }

            if (localVideoTrack) {
              await client.unpublish(localVideoTrack);
              setLocalVideoTrack(undefined);
            }

            break;

          case 'audio':
            if (localAudioTrack) {
              await client.unpublish(localAudioTrack);
              setLocalAudioTrack(undefined);
            }

            break;

          case 'video':
            if (localVideoTrack) {
              await client.unpublish(localVideoTrack);
              setLocalVideoTrack(undefined);
            }

            break;

          default:
            throw new Error('Invalid track type');
        }

        setRoomState('ready');
      } catch (error) {
        handleError(error);
      }
    },
    [client, handleError, localAudioTrack, localVideoTrack]
  );

  // Toggle mute for a media type
  const toggleAudio = useCallback(() => {
    if (localAudioTrack !== undefined) {
      localAudioTrack.setEnabled(!isEnabledAudio);
      setIsEnabledAudio((prev) => !prev);
    }
    return;
  }, [isEnabledAudio, localAudioTrack]);

  const toggleVideo = useCallback(() => {
    if (localVideoTrack !== undefined) {
      localVideoTrack.setEnabled(!isEnabledVideo);
      setIsEnabledVideo((prev) => !prev);
    }
    return;
  }, [isEnabledVideo, localVideoTrack]);

  // Leave the room and reset state
  const leave: LeaveHandler = useCallback(async () => {
    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack.close();
    }

    if (localVideoTrack) {
      localVideoTrack.stop();
      localVideoTrack.close();
    }

    try {
      await client?.leave();

      setRemoteUsers([]);
      setToken(null);
      setChannel('');
      setRoomState('idle');
    } catch (error) {
      handleError(error);
    }
  }, [client, handleError, localAudioTrack, localVideoTrack]);

  useEffect(() => {
    switch (roomState) {
      case 'idle':
        trigger('info', 'Not in a room');
        break;

      case 'ready':
        createLocalVideoAndAudioTrack().then(() =>
          trigger('info', 'Initialize succesfully')
        );
        break;

      case 'live':
        trigger('info', 'Join room successfully');
        break;

      case 'error':
        trigger('danger', 'Something went wrong, please retry');
        break;

      default:
        break;
    }
  }, [roomState, createLocalVideoAndAudioTrack, trigger]);

  // Set up listeners for agora's events
  useEffect(() => {
    if (!client) return;

    setRemoteUsers(client.remoteUsers);

    const handleUserPublished = async (
      user: IAgoraRTCRemoteUser,
      mediaType: 'audio' | 'video'
    ) => {
      await client.subscribe(user, mediaType).catch(handleError);
      setRemoteUsers(Array.from(client.remoteUsers));
    };

    const handleUserUnpublished = (_user: IAgoraRTCRemoteUser) => {
      setRemoteUsers(Array.from(client.remoteUsers));
    };

    const handleUserJoined = (__user: IAgoraRTCRemoteUser) => {
      setRemoteUsers(Array.from(client.remoteUsers));
    };

    const handleUserLeft = (__user: IAgoraRTCRemoteUser) => {
      setRemoteUsers(Array.from(client.remoteUsers));
    };

    client.on('user-published', handleUserPublished);
    client.on('user-unpublished', handleUserUnpublished);
    client.on('user-joined', handleUserJoined);
    client.on('user-left', handleUserLeft);

    return () => {
      client.off('user-published', handleUserPublished);
      client.off('user-unpublished', handleUserUnpublished);
      client.off('user-joined', handleUserJoined);
      client.off('user-left', handleUserLeft);
    };
  }, [client, handleError]);

  return {
    roomState,
    isEnabledAudio,
    isEnabledVideo,
    createRoom,
    leave,
    publishTracks,
    localAudioTrack,
    localVideoTrack,
    token,
    toggleAudio,
    toggleVideo,
    joinRoom,
    remoteUsers,
    unpublishTracks,
    channel,
  };
};

type RoomOptions = {
  channelName: string;
  token: string;
  uid?: string;
};
type RoomState = 'idle' | 'ready' | 'live' | 'error';
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
