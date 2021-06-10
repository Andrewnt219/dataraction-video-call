import AgoraVideoPlayer from 'components/AgoraVideoPlayer/AgoraVideoPlayer';
import React, { ChangeEventHandler } from 'react';
import { FaCamera } from 'react-icons/fa';
import { Input, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { useAgoraVideoSelect } from './useAgoraVideoSelect';

const AgoraVideoSelect = () => {
  const { agoraContext, videoInput } = useAgoraVideoSelect();

  const handleVideoChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const deviceId = e.target.value;

    videoInput.selectDeviceById(deviceId);
    agoraContext.handlers.localVideoTrack?.setDevice(deviceId);
  };

  return (
    <>
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            <FaCamera />
          </InputGroupText>
        </InputGroupAddon>

        <Input type="select" onChange={handleVideoChange}>
          {videoInput.availableDevices.map((device) => (
            <option value={device.deviceId} key={device.deviceId}>
              {device.label}
            </option>
          ))}
        </Input>
      </InputGroup>

      <AgoraVideoPlayer audioTrack={undefined} videoTrack={videoInput.track} />
    </>
  );
};

export default AgoraVideoSelect;
