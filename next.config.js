/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. 기존 설정 유지 (ESLint, TypeScript 무시)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  
  // 2. 기존 이미지 설정 유지
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    domains: ['lh3.googleusercontent.com', 'k.kakaocdn.net'],
  },

  // 3. [추가됨] 백엔드 통신을 위한 Rewrites(프록시) 설정
  async rewrites() {
    return [
      {
        // 프론트엔드에서 '/api/proxy/...'로 시작하는 요청이 오면
        source: "/api/proxy/:path*",
        // 백엔드(http) 서버의 해당 경로로 토스해준다.
        destination: "http://43.202.253.103:8000/:path*",
      },
    ];
  },
};

module.exports = nextConfig;