import * as React from 'react';
import { useReducer } from 'react';
import * as agoraSlice from '_lib/agora/agora-store';
import { useAlertContext } from '../../context/AlertContext';
const Context = React.createContext<Context | undefined>(undefined);

const DispatchContext =
  React.createContext<DispatchContext | undefined>(undefined);

/**
 * @description provides the agora-related app's state and actions
 */
const AgoraProvider = ({ children }: ProviderProps) => {
  const [state, dispatch] = useReducer(
    agoraSlice.reducer,
    agoraSlice.initialState
  );

  const { trigger } = useAlertContext();

  /* client-side import agora */
  React.useEffect(() => {
    import('agora-rtc-sdk-ng')
      .then(({ default: AgoraRTC }) => {
        const agoraClient = AgoraRTC.createClient({
          codec: 'h264',
          mode: 'rtc',
        });

        dispatch({ type: 'INIT_CLIENT', payload: agoraClient });
        dispatch({ type: 'INIT_RTC', payload: AgoraRTC });
      })
      .catch(() => trigger('danger', 'Fail to install Agora'));
  }, [dispatch, trigger]);

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

type Context = agoraSlice.State;
type DispatchContext = React.Dispatch<agoraSlice.Action>;
type ProviderProps = {
  children: React.ReactNode | React.ReactNode[];
};
