import { useEffect } from 'react';
import { useAgoraContext, useAgoraDispatch } from '_context/AgoraContext';
import { useAlertContext } from '_context/AlertContext';

type AudioParams = {
  kind: 'audioinput' | 'audiooutput';
};

type VideoParams = {
  kind: 'videoinput';
};

export const useAgoraDevice = ({ kind }: AudioParams | VideoParams) => {
  const state = useAgoraContext();
  const dispatch = useAgoraDispatch();
  const { trigger } = useAlertContext();

  useEffect(() => {
    const agoraRtc = state.agoraRtc;
    const getDevices = async () => {
      if (!agoraRtc) return;

      const devices = (await agoraRtc.getDevices()).filter(
        (device) => device.kind === kind
      );

      const selectedDevice = devices[0];
      if (!selectedDevice) trigger('danger', 'No device found');

      const track = await getTrack(selectedDevice);
      if (!track) return;

      dispatch({ type: 'INIT_DEVICES', payload: { devices, kind, track } });
    };

    const getTrack = async (device: MediaDeviceInfo) => {
      if (!agoraRtc) return;

      switch (device.kind) {
        case 'audioinput':
        case 'audiooutput':
          return agoraRtc.createMicrophoneAudioTrack({
            microphoneId: device.deviceId,
          });

        case 'videoinput':
          return agoraRtc.createCameraVideoTrack({
            cameraId: device.deviceId,
          });

        default:
          throw new Error('Invalid kind');
      }
    };

    void getDevices();
  }, [dispatch, kind, state.agoraRtc, trigger]);
};
