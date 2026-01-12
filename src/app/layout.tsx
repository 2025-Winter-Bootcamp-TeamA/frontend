import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import "pretendard/dist/web/variable/pretendardvariable.css"; // 폰트 추가
import Navbar from '@/components/Navbar'; // Navbar 컴포넌트 추가

export const metadata: Metadata = {
  title: 'DevRoad',
  description: '개발 트렌드 분석 및 취업 지원 플랫폼',
  // 파비콘 설정 추가
  icons: {
    icon:'/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className='font-sans'> {/* 폰트 적용 */}
        <Navbar /> {/* Navbar 컴포넌트 렌더링 */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
