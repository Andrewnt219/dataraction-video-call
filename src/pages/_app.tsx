import 'bootstrap/dist/css/bootstrap.min.css';
import type { AppProps } from 'next/app';
import '_styles/global.css';

function MyApp({ Component, pageProps }: AppProps) {
  // TODO #11 create a context for triggering (error) modal
  return <Component {...pageProps} />;
}
export default MyApp;
