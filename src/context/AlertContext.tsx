import * as React from 'react';
import type { Color } from 'reactstrap';
import { Alert } from 'reactstrap';
import { uid } from 'uid/single';

type Context = {
  trigger(type: Color, message: React.ReactNode): void;
};
const Context = React.createContext<Context | undefined>(undefined);

type ProviderProps = {
  children: React.ReactNode | React.ReactNode[];
};
const AlertProvider = ({ children }: ProviderProps) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const trigger: Context['trigger'] = React.useCallback((type, message) => {
    setToasts((prev) => [...prev, { message, type, id: uid(8) }]);

    // NOTE don't filter by id, it's weird
    setTimeout(
      () => setToasts((prev) => [...prev.filter((toast, index) => index > 0)]),
      3000
    );
  }, []);

  const value = React.useMemo(() => ({ trigger }), [trigger]);

  return (
    <Context.Provider value={value}>
      {children}

      <div className="fixed bottom-2 right-4">
        {toasts.map((toast) => (
          <Alert key={toast.id} color={toast.type} isOpen={true}>
            {toast.message}
          </Alert>
        ))}
      </div>
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

type Toast = { type: Color; message: React.ReactNode; id: string };
