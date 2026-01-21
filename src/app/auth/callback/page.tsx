"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// 1. 알맹이 컴포넌트 (로직 및 화면)
// useSearchParams는 여기서 사용합니다.
function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const access = searchParams.get("access");
    const refresh = searchParams.get("refresh");

    if (access && refresh) {
      // JWT 토큰 저장
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      // 메인 페이지로 이동
      router.push("/");
    } else {
      // 토큰 실패 시 로그인 페이지로 이동
      router.push("/login?error=auth_failed");
    }
  }, [searchParams, router]);

  // 로딩 중 보여줄 화면
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">로그인 처리 중...</h1>
        <p className="text-gray-600">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
}

// 2. 껍데기 페이지 (Suspense 적용)
// 여기서 Suspense로 감싸주어야 빌드 에러가 안 납니다.
export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">Loading...</div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}