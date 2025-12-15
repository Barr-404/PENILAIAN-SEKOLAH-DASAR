/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizeCss: false,
    optimizePackageImports: ['lucide-react', 'exceljs'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Disable static export untuk mendukung SSR dan API routes
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  // Optimasi image dan font
  images: {
    formats: ['image/avif', 'image/webp'],
    unoptimized: true, // Disable image optimization untuk Vercel
  },
  // Optimasi bundle
  webpack: (config, { dev, isServer }) => {
    // Optimasi untuk production
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunks
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|next)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name: 'lib',
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 20,
            },
          },
        },
      }
    }
    return config
  },
}

module.exports = nextConfig