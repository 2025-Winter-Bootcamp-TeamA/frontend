/** @type {import('next').NextConfig} */
const nextConfig = {
  // eslint 설정은 Next.js 16+에서 제거됨 (package.json의 scripts에서 처리)
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '**' },
      { protocol: 'http', hostname: 'k.kakaocdn.net', pathname: '**' },
      { protocol: 'https', hostname: 'k.kakaocdn.net', pathname: '**' },
      { protocol: 'https', hostname: '**' },
    ],
  },
  async rewrites() {
    // 환경 변수에서 API URL 가져오기 (프로덕션: api.devroad.cloud, 로컬: localhost:8000)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${apiUrl}/:path*`,
      },
      {
        source: "/media/:path*",
        // 미디어 파일(로고 이미지 등)을 백엔드로 프록시
        destination: `${apiUrl}/media/:path*`,
      },
    ];
  },
  */
};

module.exports = nextConfig;