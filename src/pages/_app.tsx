import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  // TODO #11 create a context for triggering (error) modal
  return <Component {...pageProps} />;
}
export default MyApp;
