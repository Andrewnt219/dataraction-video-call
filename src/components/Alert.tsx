import React, { PropsWithChildren, useState } from 'react';
import type { AlertProps } from 'reactstrap';
import { Alert as RsAlert } from 'reactstrap';

const Alert = ({ children, ...alertProps }: PropsWithChildren<AlertProps>) => {
  const [visible, setVisible] = useState(true);

  const onDismiss = () => setVisible(false);

  return (
    <RsAlert
      className="fixed bottom-2 right-4"
      {...alertProps}
      isOpen={visible}
      toggle={onDismiss}
    >
      {children}
    </RsAlert>
  );
};

export default Alert;
