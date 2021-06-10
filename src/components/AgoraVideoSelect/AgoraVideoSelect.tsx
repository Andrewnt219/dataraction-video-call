import AgoraVideoPlayer from 'components/AgoraVideoPlayer/AgoraVideoPlayer';
import React, { ChangeEventHandler } from 'react';
import { FaCamera } from 'react-icons/fa';
import { Input, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { useAgoraVideoSelect } from './useAgoraVideoSelect';

type Props = {
  hidePreview?: boolean;
};
const AgoraVideoSelect = ({ hidePreview = false }: Props) => {
  const { agoraContext, videoInput } = useAgoraVideoSelect();

  const handleVideoChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const deviceId = e.target.value;

    videoInput.selectDeviceById(deviceId);
    agoraContext.handlers.localVideoTrack?.setDevice(deviceId);
  };

  return (
    <div>
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

      {!hidePreview && (
        <div className="h-60 w-full">
          <AgoraVideoPlayer
            audioTrack={undefined}
            videoTrack={videoInput.track}
          />
        </div>
      )}
    </div>
  );
};

export default AgoraVideoSelect;
