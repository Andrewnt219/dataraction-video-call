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
import type { ErrorMessage } from '_common';
import type * as ApiAgoraGetRoomToken from '_pages/api/agora/getRoomToken';
import { getErrorMessage } from '_utils/convert-utils';

export const useAgoraHandlers = (
  client: IAgoraRTCClient | null,
  agoraRtc: IAgoraRTC | null
) => {
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

  const [error, setError] = useState<null | ErrorMessage>(null);

  // Ask for both video and microphone permission
  const createLocalVideoAndAudioTrack = useCallback(
    async (
      config?: TrackConfig
    ): Promise<[IMicrophoneAudioTrack, ICameraVideoTrack]> => {
      if (!agoraRtc) throw new Error('Agora service is not available');

      const [audioTrack, cameraTrack] =
        await agoraRtc.createMicrophoneAndCameraTracks(
          config?.audio,
          config?.video
        );

      setLocalVideoTrack(cameraTrack);
      setLocalAudioTrack(audioTrack);

      return [audioTrack, cameraTrack];
    },
    [agoraRtc]
  );

  // Ask for video permission
  const createLocalVideoTrack = useCallback(
    async (
      videoConfig?: CameraVideoTrackInitConfig
    ): Promise<ICameraVideoTrack> => {
      if (!agoraRtc) throw new Error('Agora service is not available');
      if (localVideoTrack) return localVideoTrack;

      const cameraTrack = await agoraRtc.createCameraVideoTrack(videoConfig);
      setLocalVideoTrack(cameraTrack);

      return cameraTrack;
    },
    [agoraRtc, localVideoTrack]
  );

  // Ask for local microphone permission
  const createLocalAudioTrack = useCallback(
    async (
      audioConfig?: MicrophoneAudioTrackInitConfig
    ): Promise<IMicrophoneAudioTrack> => {
      if (!agoraRtc) throw new Error('Agora service is not available');
      if (localAudioTrack) return localAudioTrack;

      const audioTrack = await agoraRtc.createMicrophoneAudioTrack(audioConfig);
      setLocalAudioTrack(audioTrack);

      return audioTrack;
    },
    [agoraRtc, localAudioTrack]
  );

  // join an existing room
  const joinRoom: JoinRoom = useCallback(
    async ({ channelName, token, uid }) => {
      if (!agoraRtc || !client) return;

      // In case user has left room before
      await createLocalVideoAndAudioTrack();

      await client?.join(NEXT_PUBLIC_AGORA_APP_ID, channelName, token, uid);

      setRoomState('ready');
      setChannel(channelName);
      setToken(token);
    },
    [agoraRtc, client, createLocalVideoAndAudioTrack]
  );

  // Create a new room with token
  const createRoom: CreateRoomHandler = useCallback(
    async (params) => {
      if (!client) return;

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
        joinRoom(roomOptions);

        setToken(data.token);
        setChannel(data.channelName);
        setRoomState('ready');
      } catch (err) {
        setError(getErrorMessage(err));
      }
    },
    [client, joinRoom]
  );

  // Publish a local track
  const publishTracks: PublishTracksHandler = useCallback(async () => {
    if (!client) return;

    if (localAudioTrack) {
      await client.publish(localAudioTrack).catch(() => {
        throw new Error('Fail to publish audio track');
      });
    }

    if (localVideoTrack) {
      await client.publish(localVideoTrack).catch(() => {
        throw new Error('Fail to publish audio track');
      });
    }

    setRoomState('live');
  }, [client, localAudioTrack, localVideoTrack]);

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
        console.log({ error });
      }
    },
    [client, localAudioTrack, localVideoTrack]
  );

  // Toggle mute for a media type
  const toggleMute = useCallback(
    (trackType: TrackType) => {
      switch (trackType) {
        case 'audio':
          if (localAudioTrack !== undefined) {
            const isEnabled = localAudioTrack.getMediaStreamTrack().enabled;

            localAudioTrack.getMediaStreamTrack().enabled = !isEnabled;
            setIsEnabledAudio(!isEnabled);
          }
          return;

        case 'video':
          if (localVideoTrack !== undefined) {
            const isMuted = !localVideoTrack.isPlaying;

            // NOTE this is weird, !isMutedVideo() doesn't work
            localVideoTrack.setEnabled(isMuted ? true : false);

            // NOTE cannot call isVideoMuted directly
            // because there is a short delay of isPlaying state switch
            setIsEnabledVideo(isMuted);
          }
          return;

        default:
          return;
      }
    },
    [localAudioTrack, localVideoTrack]
  );

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

    await client?.leave();

    setRemoteUsers([]);
    setRoomState('idle');
  }, [client, localAudioTrack, localVideoTrack]);

  useEffect(() => {
    if (roomState === 'ready') {
      createLocalVideoAndAudioTrack();
    }
  }, [roomState, createLocalVideoAndAudioTrack]);

  // Set up listeners for agora's events
  useEffect(() => {
    if (!client) return;

    setRemoteUsers(client.remoteUsers);

    const handleUserPublished = async (
      user: IAgoraRTCRemoteUser,
      mediaType: 'audio' | 'video'
    ) => {
      await client.subscribe(user, mediaType);
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
  }, [client]);

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
    toggleMute,
    error,
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
