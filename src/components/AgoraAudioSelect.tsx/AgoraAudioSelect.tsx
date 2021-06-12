import React, { ChangeEventHandler } from 'react';
import { FaMicrophone } from 'react-icons/fa';
import {
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Progress,
} from 'reactstrap';
import { useAgoraContext, useAgoraDispatch } from '_context/AgoraContext';
import { useAgoraAudioSelect } from './useAgoraAudioSelect';

type Props = {
  hidePreview?: boolean;
};
const AgoraAudioSelect = ({ hidePreview }: Props) => {
  const { volumeLevel } = useAgoraAudioSelect(hidePreview);
  const state = useAgoraContext();
  const dispatch = useAgoraDispatch();

  const handleAudioInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    dispatch({
      type: 'SET_DEVICE',
      payload: { kind: 'audioinput', deviceId: e.target.value },
    });
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
          {state.audioinput.devices.map((device) => (
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
