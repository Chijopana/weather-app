/** @type {import('next').NextConfig} */

/**
 * Content-Security-Policy.
 *
 * Se declara explícitamente en lugar de confiar solo en X-Frame-Options y
 * X-XSS-Protection (esta última está obsoleta y los navegadores modernos la
 * ignoran; se retira). `frame-ancestors 'none'` sustituye a X-Frame-Options.
 *
 * `unsafe-inline` / `unsafe-eval` en script-src son necesarios para el runtime
 * de desarrollo de Next.js; en producción se podría endurecer con nonces, a
 * costa de renderizado dinámico en cada petición.
 */
const isDev = process.env.NODE_ENV !== 'production';

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  // cdn.weatherapi.com: iconos de condición. *.tile.openstreetmap.org: teselas.
  "img-src 'self' data: blob: https://cdn.weatherapi.com https://*.tile.openstreetmap.org",
  "font-src 'self' data:",
  // El navegador solo habla con este mismo origen: la API externa la consulta
  // el servidor, no el cliente.
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // La app pide geolocalización; el resto de capacidades se deniegan.
  { key: 'Permissions-Policy', value: 'geolocation=(self), camera=(), microphone=(), payment=()' },
  { key: 'X-Frame-Options', value: 'DENY' },
];

const nextConfig = {
  reactStrictMode: true,
  compress: true,
  swcMinify: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

module.exports = nextConfig;
