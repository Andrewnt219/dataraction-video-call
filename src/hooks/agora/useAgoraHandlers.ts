import type {
  CameraVideoTrackInitConfig,
  IAgoraRTC,
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  ILocalTrack,
  IMicrophoneAudioTrack,
  MicrophoneAudioTrackInitConfig,
} from 'agora-rtc-sdk-ng';
import axios from 'axios';
import { NEXT_PUBLIC_AGORA_APP_ID } from 'constants/agora';
import { useEffect, useState } from 'react';
import type { ErrorMessage } from '_common';
import { isAudioMuted, isVideoMuted } from '_lib/agora/agora-utils';
import type * as ApiAgoraGetRoomToken from '_pages/api/agora/getRoomToken';
import { getErrorMessage } from '_utils/convert-utils';

export const useAgoraHandlers = (
  client: IAgoraRTCClient | null,
  agoraRtc: IAgoraRTC | null
) => {
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack>();
  const [localAudioTrack, setLocalAudioTrack] =
    useState<IMicrophoneAudioTrack>();

  const [isMutedVideo, setIsMutedVideo] = useState(false);
  const [isMutedAudio, setIsMutedAudio] = useState(false);

  const [token, setToken] = useState<string | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);

  const [error, setError] = useState<null | ErrorMessage>(null);

  // Ask for both video and microphone permission
  async function createLocalVideoAndAudioTrack(
    config?: TrackConfig
  ): Promise<[IMicrophoneAudioTrack, ICameraVideoTrack]> {
    if (!agoraRtc) throw new Error('Agora service is not available');

    const [audioTrack, cameraTrack] =
      await agoraRtc.createMicrophoneAndCameraTracks(
        config?.audio,
        config?.video
      );

    setLocalVideoTrack(cameraTrack);
    setLocalAudioTrack(audioTrack);

    return [audioTrack, cameraTrack];
  }

  // Ask for video permission
  async function createLocalVideoTrack(
    videoConfig?: CameraVideoTrackInitConfig
  ): Promise<ICameraVideoTrack> {
    if (!agoraRtc) throw new Error('Agora service is not available');
    if (localVideoTrack) return localVideoTrack;

    const cameraTrack = await agoraRtc.createCameraVideoTrack(videoConfig);
    setLocalVideoTrack(cameraTrack);

    return cameraTrack;
  }

  // Ask for local microphone permission
  async function createLocalAudioTrack(
    audioConfig?: MicrophoneAudioTrackInitConfig
  ): Promise<IMicrophoneAudioTrack> {
    if (!agoraRtc) throw new Error('Agora service is not available');
    if (localAudioTrack) return localAudioTrack;

    const audioTrack = await agoraRtc.createMicrophoneAudioTrack(audioConfig);
    setLocalAudioTrack(audioTrack);

    return audioTrack;
  }

  // Create a new room with token
  const createRoom: CreateRoomHandler = async (params) => {
    if (!client) return;

    try {
      const { data } = await axios.get<ApiAgoraGetRoomToken.Data>(
        '/api/agora/getRoomToken',
        {
          params,
        }
      );

      const roomOptions: RoomOptions = {
        channelName: params.channelName,
        token: data.data.token,
        uid: params.userUid?.toString(),
      };
      joinRoom(roomOptions);

      // // setJoinState('created');
      publishTracks('*');

      setToken(data.data.token);
    } catch (err) {
      setError(getErrorMessage(err));
      // setJoinState('error');
    }
  };

  // join an existing room
  const joinRoom: JoinRoom = async ({ channelName, token, uid }) => {
    await client?.join(NEXT_PUBLIC_AGORA_APP_ID, channelName, token, uid);
  };

  // Publish a local track
  const publishTracks: PublishTracksHandler = async (
    trackType,
    config = {}
  ) => {
    if (!client) return;

    let tracks: ILocalTrack | ILocalTrack[];
    try {
      switch (trackType) {
        case '*':
          tracks = await createLocalVideoAndAudioTrack(config);
          break;

        case 'audio':
          tracks = await createLocalAudioTrack(config.audio);
          break;

        case 'video':
          tracks = await createLocalVideoTrack(config.video);
          break;

        default:
          throw new Error('Invalid track type');
      }

      client.publish(tracks);
      // setJoinState('joined');
    } catch (error) {
      console.log({ error });
    }
  };

  // Unpublish a local track
  const unpublishTracks: UnpublishTracksHandler = async (trackType) => {
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

          return;

        case 'audio':
          if (localAudioTrack) {
            await client.unpublish(localAudioTrack);
            setLocalAudioTrack(undefined);
          }

          return;

        case 'video':
          if (localVideoTrack) {
            await client.unpublish(localVideoTrack);
            setLocalVideoTrack(undefined);
          }

          return;

        default:
          throw new Error('Invalid track type');
      }
      // setJoinState('joined');
    } catch (error) {
      console.log({ error });
    }
  };

  const toggleMute = (trackType: TrackType) => {
    switch (trackType) {
      case 'audio':
        if (localAudioTrack !== undefined) {
          const isMuted = isAudioMuted(localAudioTrack);

          localAudioTrack.setVolume(isMuted ? 100 : 0);
          setIsMutedAudio(!isMuted);
        }
        return;

      case 'video':
        if (localVideoTrack !== undefined) {
          const isMuted = isVideoMuted(localVideoTrack);
          // NOTE this is weird, !isMutedVideo() doesn't work
          localVideoTrack.setEnabled(isMuted ? true : false);

          // NOTE cannot call isVideoMuted directly
          // because there is a short delay of isPlaying state switch
          setIsMutedVideo(!isMuted);
        }
        return;

      default:
        return;
    }
  };

  // Leave the room and reset state
  const leave: LeaveHandler = async () => {
    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack.close();
    }
    if (localVideoTrack) {
      localVideoTrack.stop();
      localVideoTrack.close();
    }

    setRemoteUsers([]);

    // setJoinState('idle');
    await client?.leave();
  };

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
    isMutedAudio,
    isMutedVideo,
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
type PublishTracksHandler = (
  track: TrackType,
  config?: TrackConfig
) => Promise<void>;
type UnpublishTracksHandler = (track: TrackType) => Promise<void>;
type JoinRoom = (options: RoomOptions) => Promise<void>;
type LeaveHandler = () => Promise<void>;
