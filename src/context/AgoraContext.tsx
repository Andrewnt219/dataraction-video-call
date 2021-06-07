import type {
  IAgoraRTC,
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng';
import * as React from 'react';
type Context = {
  client: IAgoraRTCClient | null;
  agoraRtc: IAgoraRTC | null;
  localAudioTrack: IMicrophoneAudioTrack | undefined;
  localVideoTrack: ICameraVideoTrack | undefined;
};
const Context = React.createContext<Context | undefined>(undefined);

type ProviderProps = {
  children: React.ReactNode | React.ReactNode[];
  value: Context;
};
const AgoraProvider = ({ children, value }: ProviderProps) => {
  return <Context.Provider value={value}>{children}</Context.Provider>;
};

const useAgoraContext = (): Context => {
  const context = React.useContext(Context);

  if (context === undefined) {
    throw new Error('Must be use within AgoraContext');
  }

  return context;
};

export { AgoraProvider, useAgoraContext };
