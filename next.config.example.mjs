// next.config.mjs - SEO & Performance Optimized Configuration

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable compression for better performance
  compress: true,

  // Generate ETag headers for better caching
  generateEtags: true,

  // Experimental features for better performance
  experimental: {
    // Optimize CSS loading
    optimizeCss: true,

    // Optimize package imports (tree-shaking)
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
    ],

    // Enable Server Components by default
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Image optimization configuration
  images: {
    // Modern image formats for better performance
    formats: ['image/avif', 'image/webp'],

    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Cache optimized images for 60 seconds
    minimumCacheTTL: 60,

    // Allowed image domains (update with your CDN/storage)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },

  // Headers for security and SEO
  async headers() {
    return [
      // Cache static assets aggressively
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|webp|avif|ico|woff|woff2|ttf|eot)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Security headers
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Redirects for SEO (301 redirects)
  async redirects() {
    return [
      // Example: Redirect old URLs to new ones
      // {
      //   source: '/old-business/:slug',
      //   destination: '/business_service/:slug',
      //   permanent: true,
      // },
    ];
  },

  // Rewrites for cleaner URLs (keep URLs SEO-friendly)
  async rewrites() {
    return [
      // Example: Rewrite for API routes if needed
      // {
      //   source: '/api/:path*',
      //   destination: 'https://api.example.com/:path*',
      // },
    ];
  },

  // Output configuration
  output: 'standalone', // For Docker deployment

  // React strict mode for better development
  reactStrictMode: true,

  // Production source maps (disable for smaller bundles)
  productionBrowserSourceMaps: false,

  // Webpack configuration for optimizations
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk for better caching
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          // Common chunk for shared components
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      };
    }

    return config;
  },

  // Power by header (hide Next.js for security)
  poweredByHeader: false,

  // Trailing slash configuration (important for SEO consistency)
  trailingSlash: false,

  // Strict mode for better performance
  swcMinify: true,
};

export default nextConfig;
