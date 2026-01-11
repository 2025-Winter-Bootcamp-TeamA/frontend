import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* 헤더 */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold text-primary-600">DevLens</h1>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
            >
              회원가입
            </Link>
          </nav>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="mb-6 text-5xl font-bold text-gray-900">
          개발 트렌드를 한눈에,
          <br />
          <span className="text-primary-600">취업 준비는 스마트하게</span>
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
          DevLens는 개발자와 취업 준비생을 위한 통합 플랫폼입니다.
          실시간 기술 트렌드 분석, 이력서 매칭, AI 면접 준비까지 한 곳에서.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/trends"
            className="rounded-lg bg-primary-600 px-8 py-3 text-lg font-semibold text-white hover:bg-primary-700"
          >
            트렌드 보기
          </Link>
          <Link
            href="/jobs"
            className="rounded-lg border border-gray-300 px-8 py-3 text-lg font-semibold text-gray-700 hover:bg-gray-50"
          >
            채용 공고
          </Link>
        </div>
      </section>

      {/* 기능 소개 */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h3 className="mb-12 text-center text-3xl font-bold text-gray-900">
            주요 기능
          </h3>
          <div className="grid gap-8 md:grid-cols-3">
            {/* 트렌드 분석 */}
            <div className="rounded-xl border p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                <span className="text-3xl">📊</span>
              </div>
              <h4 className="mb-2 text-xl font-semibold">기술 트렌드 분석</h4>
              <p className="text-gray-600">
                실시간으로 수집되는 개발 관련 데이터를 기반으로
                기술 트렌드를 시각화합니다.
              </p>
            </div>

            {/* 이력서 매칭 */}
            <div className="rounded-xl border p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                <span className="text-3xl">📝</span>
              </div>
              <h4 className="mb-2 text-xl font-semibold">이력서 매칭</h4>
              <p className="text-gray-600">
                내 이력서와 채용 공고를 분석하여
                매칭률과 개선점을 제안합니다.
              </p>
            </div>

            {/* 면접 준비 */}
            <div className="rounded-xl border p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                <span className="text-3xl">🎯</span>
              </div>
              <h4 className="mb-2 text-xl font-semibold">AI 면접 준비</h4>
              <p className="text-gray-600">
                AI가 생성한 맞춤형 면접 질문으로
                실전 면접을 준비하세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2025 DevLens. 2025 Winter Bootcamp Team A</p>
        </div>
      </footer>
    </main>
  );
}
