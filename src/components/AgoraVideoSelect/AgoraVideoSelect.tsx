import AgoraVideoPlayer from 'components/AgoraVideoPlayer/AgoraVideoPlayer';
import React, { ChangeEventHandler } from 'react';
import { FaCamera } from 'react-icons/fa';
import { Input, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { useAgoraContext, useAgoraDispatch } from '_context/AgoraContext';
import { useAgoraDevice } from '_lib/agora/useAgoraDevice';

type Props = {
  hidePreview?: boolean;
};
const AgoraVideoSelect = ({ hidePreview = false }: Props) => {
  useAgoraDevice({
    kind: 'videoinput',
  });

  const state = useAgoraContext();
  const dispatch = useAgoraDispatch();

  const handleVideoChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    dispatch({
      type: 'SET_DEVICE',
      payload: { deviceId: e.target.value, kind: 'videoinput' },
    });
  };

  return (
    <div>
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            <FaCamera />
          </InputGroupText>
        </InputGroupAddon>

        <Input
          type="select"
          value={state.videoinput.selectedDevice?.deviceId}
          onChange={handleVideoChange}
        >
          {state.videoinput.devices.map((device) => (
            <option value={device.deviceId} key={device.deviceId}>
              {device.label}
            </option>
          ))}
        </Input>
      </InputGroup>

      {!hidePreview && (
        <div className="h-60 w-full mt-2">
          <AgoraVideoPlayer
            audioTrack={undefined}
            videoTrack={state.videoinput.track}
          />
        </div>
      )}
    </div>
  );
};

export default AgoraVideoSelect;
