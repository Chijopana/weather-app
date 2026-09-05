import Document, { Head, Html, Main, NextScript } from 'next/document';

/**
 * Documento base.
 * Existe sobre todo por `lang="es"`: sin el, el HTML se anunciaba como ingles y
 * los lectores de pantalla leian el contenido en castellano con voz inglesa.
 */
export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="es">
        <Head>
          <link rel="preconnect" href="https://cdn.weatherapi.com" />
          <link rel="dns-prefetch" href="https://cdn.weatherapi.com" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
