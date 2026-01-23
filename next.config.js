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
    return [
      {
        source: "/api/proxy/:path*",
        // ▼ 여기를 내 컴퓨터(Localhost) 주소로 변경!
        destination: "http://127.0.0.1:8000/:path*",
      },
      {
        source: "/media/:path*",
        // 미디어 파일(로고 이미지 등)을 백엔드로 프록시
        destination: "http://127.0.0.1:8000/media/:path*",
      },
    ];
  },
};

module.exports = nextConfig;