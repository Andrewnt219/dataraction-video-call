import 'bootstrap/dist/css/bootstrap.min.css';
import type { AppProps } from 'next/app';
import { AlertProvider } from '_context/AlertContext';
import '_styles/global.css';

function MyApp({ Component, pageProps }: AppProps) {
  // TODO #11 create a context for triggering (error) modal
  return (
    <AlertProvider>
      <Component {...pageProps} />
    </AlertProvider>
  );
}
export default MyApp;
