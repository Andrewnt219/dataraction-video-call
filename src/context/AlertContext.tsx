import * as React from 'react';
import { Alert } from 'reactstrap';
type Context = {
  trigger(type: string, message: React.ReactNode): void;
};
const Context = React.createContext<Context | undefined>(undefined);

type ProviderProps = {
  children: React.ReactNode | React.ReactNode[];
};
const AlertProvider = ({ children }: ProviderProps) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [message, setMessage] = React.useState<React.ReactNode | null>(null);

  React.useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (isVisible) {
      timerId = setTimeout(() => setIsVisible(false), 2000);
    }

    return () => {
      timerId && clearTimeout(timerId);
    };
  }, [isVisible]);

  const onDismiss = () => setIsVisible(false);

  const trigger: Context['trigger'] = React.useCallback((type, message) => {
    setIsVisible(true);
    setMessage(message);
  }, []);

  const value = React.useMemo(() => ({ trigger }), [trigger]);

  return (
    <Context.Provider value={value}>
      {children}

      <Alert
        className="fixed bottom-2 right-4"
        isOpen={isVisible}
        toggle={onDismiss}
      >
        {message}
      </Alert>
    </Context.Provider>
  );
};

const useAlertContext = (): Context => {
  const context = React.useContext(Context);

  if (context === undefined) {
    throw new Error('Must be use within AlertContext');
  }

  return context;
};

export { AlertProvider, useAlertContext };
