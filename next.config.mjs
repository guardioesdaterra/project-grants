/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  reactStrictMode: false,
  poweredByHeader: false,
  experimental: {
    optimizeCss: true,
  },
  webpack: (config, { isServer }) => {
    // Configurações para MapLibre GL JS
    if (isServer) {
      config.externals.push({
        'maplibre-gl': 'maplibre-gl',
        'leaflet': 'leaflet'
      })
    }
    
    // Resolver fallbacks para APIs do browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      canvas: false,
      "mapbox-gl": false
    }
    
    return config
  }
}

export default nextConfig