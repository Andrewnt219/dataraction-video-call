import React from 'react';
import ReactDOM from 'react-dom';
import { useAgoraContext } from '_context/AgoraContext';
import { useAgoraDevice } from '_lib/agora/useAgoraDevice';
import AgoraVideoPlayer from './AgoraVideoPlayer';

const AgoraDeviceTestModal = () => {
  const { agoraRtc, localAudioTrack, localVideoTrack } = useAgoraContext();

  const audioInput = useAgoraDevice({
    agoraRtc,
    kind: 'audioinput',
  });

  const videoInput = useAgoraDevice({
    agoraRtc,
    kind: 'videoinput',
  });

  return ReactDOM.createPortal(
    <div>
      <label>
        Input
        <select onBlur={(ev) => audioInput.selectDeviceById(ev.target.value)}>
          {audioInput.availableDevices.map((device) => (
            <option value={device.deviceId} key={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Video
        <select onBlur={(ev) => videoInput.selectDeviceById(ev.target.value)}>
          {videoInput.availableDevices.map((device) => (
            <option value={device.deviceId} key={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
      </label>

      <AgoraVideoPlayer
        audioTrack={audioInput.track}
        videoTrack={videoInput.track}
      />

      <button
        onClick={() => {
          if (audioInput.selectedDevice) {
            localAudioTrack?.setDevice(audioInput.selectedDevice.deviceId);
          }

          if (videoInput.selectedDevice) {
            localVideoTrack?.setDevice(videoInput.selectedDevice.deviceId);
          }
        }}
      >
        Finish
      </button>
    </div>,
    document.querySelector('body')!
  );
};

export default AgoraDeviceTestModal;
