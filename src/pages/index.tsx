import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import {
  FaCopy,
  FaVideo,
  FaVideoSlash,
  FaVolumeMute,
  FaVolumeUp,
} from 'react-icons/fa';
import {
  Button,
  ButtonGroup,
  Input,
  InputGroup,
  InputGroupAddon,
} from 'reactstrap';
import { AgoraProvider } from '_context/AgoraContext';
import { useAlertContext } from '_context/AlertContext';
import useAgora from '_hooks/agora/useAgora';
import AgoraVideoPlayer from '../components/AgoraVideoPlayer/AgoraVideoPlayer';

const AgoraDeviceTestModal = dynamic(
  () => import('components/AgoraDeviceTestModal'),
  {
    ssr: false,
  }
);
function Home() {
  const {
    query: { token: tokenQuery, channelName: channelNameQuery },
  } = useRouter();

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
      roomState,
      isEnabledAudio,
      isEnabledVideo,
      toggleAudio,
      toggleVideo,
      channel,
      joinRoom,
    },
  } = agora;

  const { trigger } = useAlertContext();

  const [invitation, setInvitation] = useState<string>('');

  useEffect(() => {
    if (token && channel && localAudioTrack && localVideoTrack) {
      const invitationLink = encodeURI(
        window.location.origin + `?token=${token}&channelName=${channel}`
      );

      setInvitation(invitationLink);
    }
  }, [token, channel, localAudioTrack, localVideoTrack]);

  useEffect(() => {
    if (typeof tokenQuery !== 'string' || typeof channelNameQuery !== 'string')
      return;

    joinRoom({
      token: decodeURIComponent(tokenQuery),
      channelName: decodeURIComponent(channelNameQuery),
    });
  }, [channelNameQuery, joinRoom, tokenQuery]);

  return (
    <AgoraProvider value={agora}>
      <div>
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

        <InputGroup>
          <InputGroupAddon addonType="prepend">
            <Button
              color="info"
              onClick={() => {
                navigator.clipboard.writeText(invitation);
                trigger('info', 'Copied to clipboard');
              }}
            >
              <FaCopy />
            </Button>
          </InputGroupAddon>

          <Input
            readOnly
            aria-readonly
            value={invitation}
            onClick={(e) => e.currentTarget.select()}
          />
        </InputGroup>

        <div>
          {roomState === 'live' && (
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
                  color={isEnabledAudio ? 'primary' : 'danger'}
                  title={
                    isEnabledAudio ? 'Currently unmuted' : 'Currently muted'
                  }
                  onClick={toggleAudio}
                >
                  {isEnabledAudio ? (
                    <>
                      <span className="sr-only">Unmute audio</span>
                      <FaVolumeUp />
                    </>
                  ) : (
                    <>
                      <span className="sr-only">Mute audio</span>
                      <FaVolumeMute />
                    </>
                  )}
                </Button>

                <Button
                  color={isEnabledVideo ? 'primary' : 'danger'}
                  title={
                    isEnabledVideo ? 'Currently unmuted' : 'Currently muted'
                  }
                  onClick={toggleVideo}
                >
                  {isEnabledVideo ? (
                    <>
                      <span className="sr-only">Unmute video</span>
                      <FaVideo />
                    </>
                  ) : (
                    <>
                      <span className="sr-only">Mute video</span>
                      <FaVideoSlash />
                    </>
                  )}
                </Button>
              </ButtonGroup>
            </div>
          )}

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
