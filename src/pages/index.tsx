import AgoraAudioSelect from 'components/AgoraAudioSelect.tsx/AgoraAudioSelect';
import AgoraVideoSelect from 'components/AgoraVideoSelect/AgoraVideoSelect';
import dynamic from 'next/dynamic';
import React from 'react';
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
  Card,
  CardBody,
  Input,
  InputGroup,
  InputGroupAddon,
  UncontrolledCollapse,
} from 'reactstrap';
import { useAlertContext } from '_context/AlertContext';
import { useInvitationLinkWriter } from '_hooks/useInvitationLink';
import { useInvitationLinkReader } from '_hooks/useInvitationLinkReader';
import { useAgoraContext } from '_lib/agora/AgoraContext';
import { useAgoraHandlers } from '_lib/agora/useAgoraHandlers';
import AgoraVideoPlayer from '../components/AgoraVideoPlayer/AgoraVideoPlayer';

const AgoraDeviceTestModal = dynamic(
  () => import('components/AgoraDeviceTestModal'),
  {
    ssr: false,
  }
);
function Home() {
  const { leave, createRoom, toggleAudio, toggleVideo } = useAgoraHandlers();
  const state = useAgoraContext();

  const { trigger } = useAlertContext();

  const invitation = useInvitationLinkWriter();
  useInvitationLinkReader();

  const handleCreateRoomButtonClick = () =>
    createRoom({ channelName: state.channelName });

  const handleClipboardCopyClick = () => {
    navigator.clipboard.writeText(invitation);
    trigger('info', 'Copied to clipboard');
  };

  const handleInvitationInputClick: React.MouseEventHandler<HTMLInputElement> =
    (e) => e.currentTarget.select();

  return (
    <>
      <div className="grid gap-y-4  xl:grid-cols-4 xl:gap-x-4 xl:gap-y-0">
        <div className="shadow p-4">
          <h3>Controls</h3>

          <ButtonGroup className="w-full mb-2">
            <Button color="primary" onClick={handleCreateRoomButtonClick}>
              Create
            </Button>

            <Button color="danger" onClick={leave}>
              Leave
            </Button>
          </ButtonGroup>

          <InputGroup className="mb-4">
            <InputGroupAddon addonType="prepend">
              <Button color="info" onClick={handleClipboardCopyClick}>
                <FaCopy />
              </Button>
            </InputGroupAddon>

            <Input
              readOnly
              aria-readonly
              value={invitation}
              onClick={handleInvitationInputClick}
            />
          </InputGroup>

          <div>
            <Button color="secondary" id="devices-settings" className="w-full">
              Device settings
            </Button>

            <UncontrolledCollapse toggler="#devices-settings">
              <Card>
                <CardBody>
                  <Button
                    className="mb-2 w-full"
                    color={state.isEnabledAudio ? 'primary' : 'danger'}
                    title={
                      state.isEnabledAudio
                        ? 'Currently unmuted'
                        : 'Currently muted'
                    }
                    onClick={toggleAudio}
                  >
                    {state.isEnabledAudio ? (
                      <span>
                        <span className="sr-only">Unmute audio</span>
                        <FaVolumeUp />
                      </span>
                    ) : (
                      <>
                        <span className="sr-only">Mute audio</span>
                        <FaVolumeMute />
                      </>
                    )}
                  </Button>

                  <AgoraAudioSelect hidePreview />

                  <Button
                    className="mb-2 mt-4 w-full"
                    color={state.isEnabledVideo ? 'primary' : 'danger'}
                    title={
                      state.isEnabledVideo
                        ? 'Currently unmuted'
                        : 'Currently muted'
                    }
                    onClick={toggleVideo}
                  >
                    {state.isEnabledVideo ? (
                      <span>
                        <span className="sr-only">Unmute video</span>
                        <FaVideo />
                      </span>
                    ) : (
                      <>
                        <span className="sr-only">Mute video</span>
                        <FaVideoSlash />
                      </>
                    )}
                  </Button>

                  <AgoraVideoSelect hidePreview />
                </CardBody>
              </Card>
            </UncontrolledCollapse>
          </div>
        </div>

        <div className="col-span-3 bg-gray-900">
          {state.roomState === 'live' && (
            <div className="h-60 xl:h-full">
              <AgoraVideoPlayer
                videoTrack={state.localVideoTrack}
                audioTrack={state.localAudioTrack}
              />

              <p>You</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 grid md:grid-cols-2  gap-4 xl:grid-cols-4">
        {state.remoteUsers.map((user) => (
          <div className="h-60 flex flex-col w-full" key={user.uid}>
            <AgoraVideoPlayer
              videoTrack={user.videoTrack}
              audioTrack={user.audioTrack}
            />

            <div>{`User: (${user.uid})`}</div>
          </div>
        ))}
      </div>

      {state.roomState === 'ready' && <AgoraDeviceTestModal />}
    </>
  );
}

export default Home;
