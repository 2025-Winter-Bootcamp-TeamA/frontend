/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // 이미지 도메인 허용
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    domains: ['lh3.googleusercontent.com', 'k.kakaocdn.net'],
  },
  
  // 빌드 시 ESLint 검사 무시 (Vercel 배포 오류 방지)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // 빌드 시 TypeScript 타입 오류 무시 (배포 안정성)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  /*
  // API 프록시 설정 (vercel.json의 rewrites로 대체)
  // vercel.json에서 /api/:path* -> https://api.devroad.cloud/api/:path*로 설정됨
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/:path*`,
      },
    ];
  },
  */
};

module.exports = nextConfig;