"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const access = searchParams.get("access");
    const refresh = searchParams.get("refresh");

    if (access && refresh) {
      // JWT 토큰을 localStorage에 저장
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      // 메인 페이지로 리다이렉트
      router.push("/");
    } else {
      // 토큰이 없으면 로그인 페이지로
      router.push("/login?error=auth_failed");
    }
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">로그인 처리 중...</h1>
        <p className="text-gray-600">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
}
