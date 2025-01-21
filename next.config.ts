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
  };
  webpack(config: any): any;
}

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // This header configuration applies to all routes except PDFs
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
        // Special header configuration for PDF files in temp directory
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
  // Enable the experimental optimizeCss feature
  experimental: {
    optimizeCss: true,
  },
  // Configure webpack to handle PDF files
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