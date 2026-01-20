"use client";

import { useState } from "react";
import SideNav from "./SideNav";
import FavoritesSection from "./FavoritesSection";
import ResumesSection from "./ResumesSection";

type TabKey = "resume" | "favorites" | "settings";

export default function MyPageShell() {
  const [tab, setTab] = useState<TabKey>("resume");

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1A1B1E] text-white">
      {/* 배경 효과 */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[80%] w-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[70%] w-[40%] rounded-full bg-purple-600/10 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* 사이드바 */}
          <aside className="lg:col-span-3">
            <SideNav active={tab} onChange={setTab} />
          </aside>

          {/* 메인 컨텐츠 영역 */}
          <main className="lg:col-span-9 min-w-0">
            {tab === "resume" && <ResumesSection />}

            {tab === "favorites" && <FavoritesSection />}

            {tab === "settings" && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-10 text-center text-zinc-400">
                <p>설정 기능은 준비 중입니다.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}