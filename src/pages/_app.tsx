import 'bootstrap/dist/css/bootstrap.min.css';
import type { AppProps } from 'next/app';
import { AlertProvider } from '_context/AlertContext';
import { AgoraProvider } from '_lib/agora/AgoraContext';
import '_styles/global.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AlertProvider>
      <AgoraProvider>
        <Component {...pageProps} />
      </AgoraProvider>
    </AlertProvider>
  );
}
export default MyApp;
