import type { NextConfig } from "next";

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: blob: https://lh3.googleusercontent.com https://racingnews365.com https://api.jolpica.net https://api.jolpi.ca https://ergast.com https://*.googleusercontent.com https://maps.google.com https://*.googleapis.com https://*.google.com https://*.openstreetmap.org https://images.unsplash.com https://*.unsplash.com https://upload.wikimedia.org https://*.wikimedia.org https://media.formula1.com https://*.formula1.com https://cdn-1.motorsport.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.jolpica.net https://api.jolpi.ca https://ergast.com https://*.supabase.co https://api.open-meteo.com https://accounts.google.com https://api.rss2json.com;
  frame-src 'self' https://accounts.google.com https://maps.google.com https://www.google.com https://*.google.com https://*.openstreetmap.org;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: cspHeader
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
