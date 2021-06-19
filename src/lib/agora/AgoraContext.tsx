import { IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
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

  /*  Set up listenners for room's event */
  React.useEffect(() => {
    const client = state.client;

    if (!client) return;

    dispatch({ type: 'SET_REMOTE_USER', payload: client.remoteUsers });

    const handleUserPublished = async (
      user: IAgoraRTCRemoteUser,
      mediaType: 'audio' | 'video'
    ) => {
      await client
        .subscribe(user, mediaType)
        .catch((err) => trigger('danger', err.message));
      dispatch({
        type: 'SET_REMOTE_USER',
        payload: Array.from(client.remoteUsers),
      });
    };

    const handleUserUnpublished = (user: IAgoraRTCRemoteUser) => {
      dispatch({
        type: 'SET_REMOTE_USER',
        payload: Array.from(client.remoteUsers),
      });
    };

    const handleUserJoined = (user: IAgoraRTCRemoteUser) => {
      dispatch({
        type: 'SET_REMOTE_USER',
        payload: Array.from(client.remoteUsers),
      });
      trigger('info', `${user.uid} has joined`);
    };

    const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
      dispatch({
        type: 'SET_REMOTE_USER',
        payload: Array.from(client.remoteUsers),
      });
      trigger('info', `${user.uid} has left`);
    };

    client.on('user-published', handleUserPublished);
    client.on('user-unpublished', handleUserUnpublished);
    client.on('user-joined', handleUserJoined);
    client.on('user-left', handleUserLeft);

    return () => {
      client.off('user-published', handleUserPublished);
      client.off('user-unpublished', handleUserUnpublished);
      client.off('user-joined', handleUserJoined);
      client.off('user-left', handleUserLeft);
    };
  }, [state.client, dispatch, trigger]);

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
