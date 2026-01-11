import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import "pretendard/dist/web/variable/pretendardvariable.css"; // 폰트 추가

export const metadata: Metadata = {
  title: 'TeamA - 개발 트렌드 분석 플랫폼',
  description: '개발 트렌드 분석 및 취업 지원 플랫폼',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className='font-sans'> {/* 폰트 적용 */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
