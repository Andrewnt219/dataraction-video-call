import * as React from 'react';
import useAgora from '_hooks/agora/useAgora';
type Context = ReturnType<typeof useAgora>;
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
