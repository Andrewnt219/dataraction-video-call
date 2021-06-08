import type {
  IAgoraRTC,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng';
import { useEffect, useState } from 'react';

type AudioParams = {
  kind: 'audioinput' | 'audiooutput';

  agoraRtc: IAgoraRTC | null;
};

type VideoParams = {
  kind: 'videoinput';

  agoraRtc: IAgoraRTC | null;
};

export const useAgoraDevice = ({
  agoraRtc,
  kind,
}: AudioParams | VideoParams) => {
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>(
    []
  );
  const [selectedDevice, setSelectedDevice] =
    useState<MediaDeviceInfo | null>(null);
  const [track, setTrack] =
    useState<ICameraVideoTrack | IMicrophoneAudioTrack>();

  const selectDeviceById = (deviceId: string) => {
    if (!track) throw new Error("Local track doesn't exist");

    const device = availableDevices.find(
      (device) => device.deviceId === deviceId
    );
    if (!device) throw new Error("Invalid device's id");

    setSelectedDevice(device);
    track.setDevice(device.deviceId);
  };

  useEffect(() => {
    const getDevices = async () => {
      if (!agoraRtc) return;

      const devices = (await agoraRtc.getDevices()).filter(
        (device) => device.kind === kind
      );

      const selectedDevice = devices[0];

      if (!selectedDevice) throw new Error('No device found');

      const track = await getTrack(selectedDevice);

      setTrack(track);
      setAvailableDevices(devices);
    };

    const getTrack = async (device: MediaDeviceInfo) => {
      if (!agoraRtc) return;

      switch (device.kind) {
        case 'audioinput':
        case 'audiooutput':
          return agoraRtc.createMicrophoneAudioTrack({
            microphoneId: device.deviceId,
          });
          break;

        case 'videoinput':
          return agoraRtc.createCameraVideoTrack({
            cameraId: device.deviceId,
          });
          break;

        default:
          throw new Error('Invalid kind');
      }
    };

    void getDevices();
  }, [agoraRtc, kind]);

  return {
    availableDevices,
    track,
    selectDeviceById,
    selectedDevice,
  };
};
