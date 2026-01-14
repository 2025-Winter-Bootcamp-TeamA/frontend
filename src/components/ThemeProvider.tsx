"use client";

import { useEffect, useState } from "react";
import { useThemeStore } from "@/store/themeStore";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((state) => state.theme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 초기 테마 적용 (SSR 하이드레이션 후)
    const html = document.documentElement;
    html.classList.remove('light', 'dark');
    html.classList.add(theme);
  }, [theme]);

  // SSR 하이드레이션 완료 전까지는 기본 테마 유지
  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
