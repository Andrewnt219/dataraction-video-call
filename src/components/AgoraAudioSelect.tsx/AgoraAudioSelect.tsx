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

type Props = {
  hidePreview?: boolean;
};
const AgoraAudioSelect = ({ hidePreview }: Props) => {
  const { audioInput, volumeLevel } = useAgoraAudioSelect(hidePreview);
  const { localAudioTrack } = useAgoraContext();

  const handleAudioInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const deviceId = e.target.value;

    audioInput.selectDeviceById(deviceId);
    localAudioTrack?.setDevice(deviceId);
  };

  return (
    <div>
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
    </div>
  );
};

export default AgoraAudioSelect;
