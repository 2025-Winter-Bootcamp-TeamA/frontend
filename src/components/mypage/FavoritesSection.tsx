"use client";

import { useMemo, useState, useEffect } from "react";
import { useFavoritesStore } from "@/store/favoritesStore";
import { MOCK_CORPS, MOCK_TECH_STACKS } from "@/data/mockData";
import { getAuthTokens } from "@/lib/auth";
import LoginModal from "@/components/LoginModal";
import { TechCategory } from "@/types";

type FavoritesTab = "tech" | "company";
type TechFilter = "all" | TechCategory;

const TECH_CATEGORY_LABEL: Record<TechFilter, string> = {
  all: "전체",
  frontend: "Frontend",
  backend: "Backend",
  "ai-data": "AI / Data",
  mobile: "Mobile",
  devops: "DevOps",
  etc: "기타",
};

const PAGE_SIZE = 6;

export default function FavoritesSection() {
  const [tab, setTab] = useState<FavoritesTab>("tech");
  const [techFilter, setTechFilter] = useState<TechFilter>("all");
  const [page, setPage] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 로그인 상태 확인
  useEffect(() => {
    const { accessToken } = getAuthTokens();
    setIsLoggedIn(!!accessToken);
  }, []);

  // Store Hooks
  const { isTechFavorite, toggleTechFavorite, isCorpFavorite, toggleCorpFavorite } = useFavoritesStore();

  // --- 기술 스택 필터링 ---
  const favoriteTechs = useMemo(() => {
    let list = MOCK_TECH_STACKS.filter((t) => isTechFavorite(t.id));
    if (techFilter !== "all") {
      list = list.filter((t) => t.category === techFilter);
    }
    // 최신순 정렬
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [isTechFavorite, techFilter]);

  // --- 기업 필터링 ---
  const favoriteCorps = useMemo(() => {
    return MOCK_CORPS.filter((c) => isCorpFavorite(c.id));
  }, [isCorpFavorite]);

  // 현재 탭 데이터
  const currentData = tab === "company" ? favoriteCorps : favoriteTechs;

  // 페이지네이션
  const totalPages = Math.max(1, Math.ceil(currentData.length / PAGE_SIZE));
  const pagedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return currentData.slice(start, start + PAGE_SIZE);
  }, [currentData, page]);

  // 핸들러
  const handleToggle = (id: number) => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }
    if (tab === "company") toggleCorpFavorite(id);
    else toggleTechFavorite(id);
  };

  const handleTabChange = (newTab: FavoritesTab) => {
    setTab(newTab);
    setPage(1);
  };

  const renderEmpty = (text: string) => (
    <div className="flex h-40 flex-col items-center justify-center rounded-xl bg-white/5 text-zinc-400 text-sm">
      <p>{text}</p>
    </div>
  );

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <header className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-50">즐겨찾기 목록</h2>
      </header>

      {/* 탭 버튼 */}
      <div className="mb-6 flex items-center gap-4 text-sm border-b border-zinc-700/50 pb-1">
        <button
          onClick={() => handleTabChange("tech")}
          className={`pb-2 px-1 transition-colors ${tab === "tech" ? "border-b-2 border-blue-500 text-white font-bold" : "text-zinc-400 hover:text-white"}`}
        >
          기술 스택
        </button>
        <button
          onClick={() => handleTabChange("company")}
          className={`pb-2 px-1 transition-colors ${tab === "company" ? "border-b-2 border-blue-500 text-white font-bold" : "text-zinc-400 hover:text-white"}`}
        >
          기업
        </button>
      </div>

      {/* 기술 스택 필터 (기술 탭일 때만 표시) */}
      {tab === "tech" && (
        <div className="mb-4 flex justify-end">
          <select
            className="bg-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-1.5 border border-zinc-700 outline-none focus:border-blue-500"
            value={techFilter}
            onChange={(e) => { setTechFilter(e.target.value as TechFilter); setPage(1); }}
          >
            {Object.entries(TECH_CATEGORY_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      )}

      {/* 목록 렌더링 */}
      <div className="space-y-3 min-h-[300px]">
        {pagedData.length === 0 ? renderEmpty("즐겨찾기한 항목이 없습니다.") : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pagedData.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-950/50 hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-3">
                  {/* 로고 (TechStack: logo, Corp: logoUrl - 조건부 처리) */}
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1 shrink-0 overflow-hidden">
                    <img 
                      src={tab === "company" ? item.logoUrl : item.logo} 
                      alt={item.name} 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{item.name}</div>
                    <div className="text-xs text-zinc-400">
                      {tab === "company" 
                        ? `${item.industry} · ${item.area}` // 기업 정보
                        : `Category: ${TECH_CATEGORY_LABEL[item.category as TechFilter] || item.category}` // 기술 정보
                      }
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* 기업일 경우 사이트 링크 버튼 */}
                  {tab === "company" && item.siteUrl && (
                    <a href={item.siteUrl} target="_blank" rel="noreferrer" className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-1 rounded hover:bg-zinc-700">
                      Site
                    </a>
                  )}
                  {/* 기술일 경우 문서 링크 버튼 */}
                  {tab === "tech" && item.docsUrl && (
                    <a href={item.docsUrl} target="_blank" rel="noreferrer" className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-1 rounded hover:bg-zinc-700">
                      Docs
                    </a>
                  )}
                  <button 
                    onClick={() => handleToggle(item.id)} 
                    className="text-yellow-400 hover:scale-110 transition-transform p-1"
                  >
                    ★
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`min-w-[28px] rounded-md px-2 py-1 text-xs ${p === page ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:bg-zinc-800"}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}