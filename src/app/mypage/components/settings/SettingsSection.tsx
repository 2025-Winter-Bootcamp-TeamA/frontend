"use client";

import { useState } from "react";
import { useThemeStore } from "@/store/themeStore";
import LeaveConfirmModal from "./LeaveConfirmModal";

export default function SettingsSection() {
  const { theme, toggleTheme } = useThemeStore();
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-white p-6 lg:p-8">
      <h2 className="text-lg font-semibold text-zinc-50 dark:text-zinc-50 light:text-zinc-900">설정</h2>

      <div className="mt-8 space-y-8">
        {/* 테마 설정 영역 */}
        <section className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-200 dark:text-zinc-200 light:text-zinc-800">테마</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500 light:text-zinc-600">
              화면의 밝기를 조절할 수 있습니다.
            </p>
          </div>

          <div className="inline-flex items-center rounded-full border border-zinc-700 dark:border-zinc-700 light:border-zinc-300 bg-zinc-900 dark:bg-zinc-900 light:bg-zinc-100 px-1 py-1 text-xs shadow-inner">
            <button
              type="button"
              onClick={() => useThemeStore.getState().setTheme("light")}
              className={[
                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5",
                theme === "light"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-zinc-500 dark:text-zinc-400 light:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-200",
              ].join(" ")}
            >
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill={theme === "light" ? "currentColor" : "none"} 
                stroke="currentColor" 
                strokeWidth="2"
                className="transition-colors"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
              라이트
            </button>
            <button
              type="button"
              onClick={() => useThemeStore.getState().setTheme("dark")}
              className={[
                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5",
                theme === "dark"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-zinc-500 dark:text-zinc-400 light:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-200",
              ].join(" ")}
            >
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill={theme === "dark" ? "currentColor" : "none"} 
                stroke="currentColor" 
                strokeWidth="2"
                className="transition-colors"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              다크
            </button>
          </div>
        </section>

        <hr className="border-zinc-800 dark:border-zinc-800 light:border-zinc-200" />

        {/* 회원탈퇴 영역 */}
        <section className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-200 dark:text-zinc-200 light:text-zinc-800">회원탈퇴</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500 light:text-zinc-600">
              DevRoad 계정을 삭제하고 서비스를 더 이상 이용하지 않습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsLeaveOpen(true)}
            className="text-sm font-semibold text-red-500 hover:text-red-400 transition-colors"
          >
            회원탈퇴
          </button>
        </section>
      </div>

      <LeaveConfirmModal
        open={isLeaveOpen}
        onClose={() => setIsLeaveOpen(false)}
      />
    </div>
  );
}
