import { useEffect } from 'react';
import { useAlertContext } from '_context/AlertContext';
import { useAgoraContext, useAgoraDispatch } from '_lib/agora/AgoraContext';

/**
 * @description initialize a type of media device
 */
export const useAgoraDevice = ({ kind }: { kind: MediaDeviceKind }) => {
  const state = useAgoraContext();
  const dispatch = useAgoraDispatch();
  const { trigger } = useAlertContext();

  useEffect(() => {
    const agoraRtc = state.agoraRtc;

    /* Update store with all the availble devices for a kind */
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

    /* Create a matching track for the passed kind */
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
