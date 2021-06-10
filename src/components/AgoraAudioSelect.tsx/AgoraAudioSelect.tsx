import React, { ChangeEventHandler } from 'react';
import { FaMicrophone } from 'react-icons/fa';
import {
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Progress,
} from 'reactstrap';
import { useAgoraContext } from '_context/AgoraContext';
import { useAgoraAudioSelect } from './useAgoraAudioSelect';

const AgoraAudioSelect = () => {
  const { audioInput, volumeLevel } = useAgoraAudioSelect();
  const {
    handlers: { localAudioTrack },
  } = useAgoraContext();

  const handleAudioInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const deviceId = e.target.value;

    audioInput.selectDeviceById(deviceId);
    localAudioTrack?.setDevice(deviceId);
  };

  return (
    <>
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            <FaMicrophone />
          </InputGroupText>
        </InputGroupAddon>

        <Input type="select" onChange={handleAudioInputChange}>
          {audioInput.availableDevices.map((device) => (
            <option value={device.deviceId} key={device.deviceId}>
              {device.label}
            </option>
          ))}
        </Input>
      </InputGroup>

      <Progress className="mt-2" color="success" value={volumeLevel * 100} />
    </>
  );
};

export default AgoraAudioSelect;
