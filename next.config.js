/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // 移除 optimizeCss 配置，它可能導致問題
  },
  // 添加 webpack 配置來處理 CSS
  webpack: (config) => {
    return config;
  },
  images: {
    domains: ['via.placeholder.com', 'lh3.googleusercontent.com', 'placeholder.com'],
  },
};

module.exports = nextConfig; 