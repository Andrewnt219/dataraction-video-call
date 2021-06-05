import type {
  CameraVideoTrackInitConfig,
  ClientConfig,
  IAgoraRTC,
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  ILocalAudioTrack,
  ILocalVideoTrack,
  IMicrophoneAudioTrack,
  MicrophoneAudioTrackInitConfig,
} from 'agora-rtc-sdk-ng';
import axios from 'axios';
import { NEXT_PUBLIC_AGORA_APP_ID } from 'constants/agora';
import { useEffect, useState } from 'react';
import type { Error } from '_common';
import type * as ApiAgoraGetRoomToken from '_pages/api/agora/getRoomToken';
import { getErrorMessage } from '_utils/convert-utils';

type ReturnType = {
  localAudioTrack: ILocalAudioTrack | undefined;
  localVideoTrack: ILocalVideoTrack | undefined;
  joinState: 'idle' | 'created' | 'joined' | 'error';
  leave: Function;
  publish: Function;
  createRoom: Function;
  remoteUsers: IAgoraRTCRemoteUser[];
  client: IAgoraRTCClient | null;
  error: null | Error;
  token: string | null;
};
export default function useAgora(clientConfig?: ClientConfig): ReturnType {
  const [agoraRtc, setAgoraRtc] = useState<IAgoraRTC | null>(null);
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);

  const [token, setToken] = useState<string | null>(null);
  const [localVideoTrack, setLocalVideoTrack] =
    useState<ILocalVideoTrack | undefined>(undefined);
  const [localAudioTrack, setLocalAudioTrack] =
    useState<ILocalAudioTrack | undefined>(undefined);

  // const [joinState, setJoinState] = useState<ReturnType['joinState']>('idle');
  const [error, setError] = useState<null | Error>(null);

  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);

  async function createLocalTracks(
    audioConfig?: MicrophoneAudioTrackInitConfig,
    videoConfig?: CameraVideoTrackInitConfig
  ): Promise<[IMicrophoneAudioTrack, ICameraVideoTrack]> {
    if (!agoraRtc) throw new Error('Agora service is not available');

    const [microphoneTrack, cameraTrack] =
      await agoraRtc.createMicrophoneAndCameraTracks(audioConfig, videoConfig);
    setLocalAudioTrack(microphoneTrack);
    setLocalVideoTrack(cameraTrack);
    return [microphoneTrack, cameraTrack];
  }

  async function createRoom(params: ApiAgoraGetRoomToken.Query) {
    if (!client) return;

    try {
      const { data } = await axios.get<ApiAgoraGetRoomToken.Data>(
        '/api/agora/room',
        {
          params,
        }
      );

      // setJoinState('created');
      publish(params.channelName, data.data.token, params.userUid?.toString());
      setToken(data.data.token);
    } catch (err) {
      setError(getErrorMessage(err));
      // setJoinState('error');
    }
  }

  async function publish(channelName: string, token: string, uid?: string) {
    if (!client) return;

    try {
      await client.join(NEXT_PUBLIC_AGORA_APP_ID, channelName, token, uid);

      const [microphoneTrack, cameraTrack] = await createLocalTracks();

      await client.publish([microphoneTrack, cameraTrack]);

      // setJoinState('joined');
    } catch (error) {
      console.log({ error });
    }
  }

  async function leave() {
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
  }

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
      .catch((err) => 'Fail to load Agora');
  }, []);

  useEffect(() => {
    if (!client) return;
    setRemoteUsers(client.remoteUsers);

    const handleUserPublished = async (
      user: IAgoraRTCRemoteUser,
      mediaType: 'audio' | 'video'
    ) => {
      await client.subscribe(user, mediaType);
      // toggle rerender while state of remoteUsers changed.
      setRemoteUsers((remoteUsers) => Array.from(client.remoteUsers));
    };
    const handleUserUnpublished = (user: IAgoraRTCRemoteUser) => {
      setRemoteUsers((remoteUsers) => Array.from(client.remoteUsers));
    };
    const handleUserJoined = (user: IAgoraRTCRemoteUser) => {
      setRemoteUsers((remoteUsers) => Array.from(client.remoteUsers));
    };
    const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
      setRemoteUsers((remoteUsers) => Array.from(client.remoteUsers));
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
    localAudioTrack,
    localVideoTrack,
    joinState: 'idle',
    leave,
    publish,
    createRoom,
    remoteUsers,
    client,
    error,
    token,
  };
}
