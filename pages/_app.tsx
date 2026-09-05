import type { AppProps } from 'next/app';
import Head from 'next/head';
import React from 'react';

import ErrorBoundary from '../components/ErrorBoundary';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#101728" />
        <meta name="color-scheme" content="dark" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Clima" />
        <meta
          property="og:description"
          content="Pronostico del tiempo por hora y por dia, con alertas oficiales, calidad del aire y mapa."
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      {/* Un unico Error Boundary, en la raiz. Antes habia otro anidado dentro de
          la pagina, que capturaba primero y hacia inalcanzable a este. */}
      <ErrorBoundary>
        <Component {...pageProps} />
      </ErrorBoundary>
    </>
  );
}
