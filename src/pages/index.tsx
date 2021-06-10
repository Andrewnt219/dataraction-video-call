import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import {
  FaVideo,
  FaVideoSlash,
  FaVolumeMute,
  FaVolumeUp,
} from 'react-icons/fa';
import { Button, ButtonGroup } from 'reactstrap';
import { AgoraProvider } from '_context/AgoraContext';
import useAgora from '_hooks/agora/useAgora';
import AgoraVideoPlayer from '../components/AgoraVideoPlayer';

const AgoraDeviceTestModal = dynamic(
  () => import('components/AgoraDeviceTestModal'),
  {
    ssr: false,
  }
);
function Home() {
  const agora = useAgora();
  const {
    client,

    handlers: {
      localAudioTrack,
      localVideoTrack,
      leave,
      createRoom,
      remoteUsers,
      token,
      error,
      roomState,
      isEnabledAudio,
      isEnabledVideo,
      toggleMute,
      channel,
    },
  } = agora;

  const [invitation, setInvitation] = useState<string>('');

  useEffect(() => {
    if (token && channel) {
      const invitationLink =
        window.location.origin + `?token=${token}&channelName=${channel}`;

      setInvitation(invitationLink);
    }
  }, [token, channel]);

  return (
    <AgoraProvider value={agora}>
      <div>
        <h1>{error?.message}</h1>
        <a href={invitation} target="_blank" rel="noopener noreferrer">
          {invitation}
        </a>

        <ButtonGroup size="sm">
          <Button
            color="primary"
            onClick={() => {
              createRoom({ channelName: channel });
            }}
          >
            Create
          </Button>

          <Button color="danger" onClick={leave}>
            Leave
          </Button>
        </ButtonGroup>

        <div>
          <div>
            <p>
              {localVideoTrack && 'localTrack'}
              {localVideoTrack ? `(${client?.uid})` : ''}
            </p>
            <AgoraVideoPlayer
              videoTrack={localVideoTrack}
              audioTrack={localAudioTrack}
            />

            <ButtonGroup size="sm">
              <Button
                color={isEnabledAudio ? 'danger' : 'primary'}
                onClick={() => {
                  toggleMute('audio');
                }}
              >
                {isEnabledAudio ? (
                  <>
                    <span className="sr-only">Mute audio</span>
                    <FaVolumeMute />
                  </>
                ) : (
                  <>
                    <span className="sr-only">Unmute audio</span>
                    <FaVolumeUp />
                  </>
                )}
              </Button>

              <Button
                color={isEnabledVideo ? 'danger' : 'primary'}
                onClick={() => {
                  toggleMute('video');
                }}
              >
                {isEnabledVideo ? (
                  <>
                    <span className="sr-only">Mute video</span>
                    <FaVideoSlash />
                  </>
                ) : (
                  <>
                    <span className="sr-only">Unmute video</span>
                    <FaVideo />
                  </>
                )}
              </Button>
            </ButtonGroup>
          </div>

          {remoteUsers.map((user) => (
            <div key={user.uid}>
              <p>{`remoteVideo(${user.uid})`}</p>
              <AgoraVideoPlayer
                videoTrack={user.videoTrack}
                audioTrack={user.audioTrack}
              />
            </div>
          ))}
        </div>
      </div>
      {roomState === 'ready' && <AgoraDeviceTestModal />}
    </AgoraProvider>
  );
}

export default Home;
