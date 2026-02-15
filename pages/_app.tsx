/**
 * Next.js App Component
 * Global app wrapper with error boundary and metadata
 */

import Head from 'next/head';
import type { AppProps } from 'next/app';
import ErrorBoundary from '../components/ErrorBoundary';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Weather app - Real-time weather forecasts with beautiful UI" />
        <meta name="theme-color" content="#1a1a2e" />
        <title>Weather App</title>
      </Head>
      <ErrorBoundary>
        <Component {...pageProps} />
      </ErrorBoundary>
    </>
  );
}
