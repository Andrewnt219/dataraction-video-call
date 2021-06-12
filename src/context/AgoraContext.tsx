import * as React from 'react';
import { useReducer } from 'react';
import * as agoraSlice from '_lib/agora/agora-store';
type Context = agoraSlice.State;
const Context = React.createContext<Context | undefined>(undefined);

type DispatchContext = React.Dispatch<agoraSlice.Action>;
const DispatchContext =
  React.createContext<DispatchContext | undefined>(undefined);

type ProviderProps = {
  children: React.ReactNode | React.ReactNode[];
};
const AgoraProvider = ({ children }: ProviderProps) => {
  const [state, dispatch] = useReducer(
    agoraSlice.reducer,
    agoraSlice.initialState
  );

  return (
    <Context.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </Context.Provider>
  );
};

const useAgoraContext = (): Context => {
  const context = React.useContext(Context);

  if (context === undefined) {
    throw new Error('Must be use within AgoraContext');
  }

  return context;
};

const useAgoraDispatch = (): DispatchContext => {
  const context = React.useContext(DispatchContext);

  if (context === undefined) {
    throw new Error('Must be use within AgoraContext');
  }

  return context;
};

export { AgoraProvider, useAgoraContext, useAgoraDispatch };
