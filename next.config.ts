/** @type {import('next').NextConfig} */
interface HeaderConfig {
  source: string;
  headers: Array<{
    key: string;
    value: string;
  }>;
}

interface NextConfig {
  headers(): Promise<HeaderConfig[]>;
  experimental: {
    optimizeCss: boolean;
    // Add additional configuration for CSS optimization
    craCompat?: boolean;
  };
  webpack(config: any): any;
}

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*((?!temp/).*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
        ],
      },
      {
        source: '/temp/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; object-src 'self'; frame-ancestors 'self'",
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
  experimental: {
    optimizeCss: false, // Disable CSS optimization temporarily
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.pdf$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[hash][ext][query]',
      },
    });
    return config;
  },
};

module.exports = nextConfig;