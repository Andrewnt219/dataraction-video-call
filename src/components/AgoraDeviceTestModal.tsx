import React, {
  ChangeEventHandler,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { FaCamera, FaMicrophone } from 'react-icons/fa';
import {
  Button,
  Container,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Progress,
} from 'reactstrap';
import { useAgoraContext } from '_context/AgoraContext';
import { isMicrophoneTrack } from '_lib/agora/agora-utils';
import { useAgoraDevice } from '_lib/agora/useAgoraDevice';
import AgoraVideoPlayer from './AgoraVideoPlayer';
const AgoraDeviceTestModal = () => {
  const { agoraRtc, localAudioTrack, localVideoTrack } = useAgoraContext();
  const [volumeLevel, setVolumeLevel] = useState(0);

  const audioInput = useAgoraDevice({
    agoraRtc,
    kind: 'audioinput',
  });

  const videoInput = useAgoraDevice({
    agoraRtc,
    kind: 'videoinput',
  });

  // TODO clean up these into custom hookS, only expose things that are used by the components
  useEffect(() => {
    const track = audioInput.track;

    if (!track || !isMicrophoneTrack(track)) return;

    const updateVolumeLevel = () => setVolumeLevel(track.getVolumeLevel());

    const timerId = setInterval(updateVolumeLevel, 450);

    return () => clearInterval(timerId);
  }, [audioInput.track]);

  const handleModalClose = () => {
    if (audioInput.selectedDevice) {
      localAudioTrack?.setDevice(audioInput.selectedDevice.deviceId);
    }

    if (videoInput.selectedDevice) {
      localVideoTrack?.setDevice(videoInput.selectedDevice.deviceId);
    }
  };

  const handleAudioInputChange: ChangeEventHandler<HTMLInputElement> = (e) =>
    audioInput.selectDeviceById(e.target.value);
  const handleVideoChange: ChangeEventHandler<HTMLInputElement> = (e) =>
    audioInput.selectDeviceById(e.target.value);

  return (
    <DeviceTestModal onClose={handleModalClose}>
      <Container>
        <Form>
          <FormGroup>
            <h5>Microphone</h5>

            <p>Produce sounds to check if the mic works.</p>

            <DeviceSelect
              devices={audioInput.availableDevices}
              onChange={handleAudioInputChange}
              title={<FaMicrophone />}
            />
          </FormGroup>

          <Progress
            className="mb-4"
            color="success"
            value={volumeLevel * 100}
          />

          <FormGroup>
            <h5>Camera</h5>

            <p>Move in front of the camera to check if it works.</p>

            <DeviceSelect
              devices={videoInput.availableDevices}
              onChange={handleVideoChange}
              title={<FaCamera />}
            />
          </FormGroup>
        </Form>

        <AgoraVideoPlayer
          audioTrack={audioInput.track}
          videoTrack={videoInput.track}
        />
      </Container>
    </DeviceTestModal>
  );
};

type DeviceTestModalProps = {
  onClose: () => void;
};
const DeviceTestModal = ({
  children,
  onClose,
}: PropsWithChildren<DeviceTestModalProps>) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClosed={handleClose}>
      <ModalHeader>Media Device Test</ModalHeader>
      <ModalBody>{children}</ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleClose}>
          Finish
        </Button>
      </ModalFooter>
    </Modal>
  );
};

type DeviceSelectProps = {
  devices: MediaDeviceInfo[];
  onChange: ChangeEventHandler<HTMLInputElement>;
  title: ReactNode;
};
const DeviceSelect = ({ devices, onChange, title }: DeviceSelectProps) => {
  return (
    <InputGroup>
      <InputGroupAddon addonType="prepend">
        <InputGroupText>{title}</InputGroupText>
      </InputGroupAddon>

      <Input type="select" onChange={onChange}>
        {devices.map((device) => (
          <option value={device.deviceId} key={device.deviceId}>
            {device.label}
          </option>
        ))}
      </Input>
    </InputGroup>
  );
};

export default AgoraDeviceTestModal;
