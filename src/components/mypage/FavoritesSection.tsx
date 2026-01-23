"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useFavoritesStore } from "@/store/favoritesStore";
import { getAuthTokens } from "@/lib/auth";
import LoginModal from "@/components/LoginModal";
import { TechCategory, TechStack, Corp } from "@/types";
import { api } from "@/lib/api";

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
  const router = useRouter();
  const [tab, setTab] = useState<FavoritesTab>("tech");
  const [techFilter, setTechFilter] = useState<TechFilter>("all");
  const [page, setPage] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [techStacks, setTechStacks] = useState<TechStack[]>([]);
  const [corps, setCorps] = useState<Corp[]>([]);
  const [isLoadingTechs, setIsLoadingTechs] = useState(false);
  const [isLoadingCorps, setIsLoadingCorps] = useState(false);

  // 로그인 상태 확인
  useEffect(() => {
    const { accessToken } = getAuthTokens();
    setIsLoggedIn(!!accessToken);
  }, []);

  // ✅ API에서 즐겨찾기 기술 스택 가져오기
  const fetchFavoriteTechStacks = useCallback(async () => {
    const { accessToken } = getAuthTokens();
    if (!accessToken) {
      setTechStacks([]);
      return;
    }

    setIsLoadingTechs(true);
    try {
      const response = await api.get('/trends/tech-bookmarks/');
      const bookmarks = response.data.results || response.data || [];
      
      const formattedTechStacks: TechStack[] = bookmarks.map((bookmark: any) => {
        const techStack = bookmark.tech_stack || bookmark;
        return {
          id: techStack.tech_stack_id || techStack.id,
          name: techStack.tech_name || techStack.name,
          logo: techStack.logo || null,
          docsUrl: techStack.docs_url || null,
          createdAt: bookmark.created_at || techStack.created_at,
          category: techStack.category_name?.[0] || undefined, // 첫 번째 카테고리 사용
        };
      });
      
      setTechStacks(formattedTechStacks);
    } catch (error) {
      console.error('즐겨찾기 기술 스택 불러오기 실패:', error);
      setTechStacks([]);
    } finally {
      setIsLoadingTechs(false);
    }
  }, []);

  // ✅ API에서 즐겨찾기 기업 가져오기
  const fetchFavoriteCorps = useCallback(async () => {
    const { accessToken } = getAuthTokens();
    if (!accessToken) {
      setCorps([]);
      return;
    }

    setIsLoadingCorps(true);
    try {
      const response = await api.get('/jobs/corp-bookmarks/');
      const bookmarks = response.data.results || response.data || [];
      
      const formattedCorps: Corp[] = bookmarks.map((bookmark: any) => {
        const corp = bookmark.corp || bookmark;
        return {
          id: corp.id,
          name: corp.name,
          logoUrl: corp.logo_url || null,
          address: corp.address || null,
          latitude: corp.latitude || undefined,
          longitude: corp.longitude || undefined,
        };
      });
      
      setCorps(formattedCorps);
    } catch (error) {
      console.error('즐겨찾기 기업 불러오기 실패:', error);
      setCorps([]);
    } finally {
      setIsLoadingCorps(false);
    }
  }, []);

  useEffect(() => {
    fetchFavoriteTechStacks();
  }, [isLoggedIn, fetchFavoriteTechStacks]);

  useEffect(() => {
    fetchFavoriteCorps();
  }, [isLoggedIn, fetchFavoriteCorps]);

  // ✅ 즐겨찾기 변경 이벤트 리스너
  useEffect(() => {
    const handleFavoriteChanged = (event: CustomEvent) => {
      const { type } = event.detail;
      if (type === 'tech') {
        fetchFavoriteTechStacks();
      } else if (type === 'company') {
        fetchFavoriteCorps();
      }
    };

    window.addEventListener('favoriteChanged', handleFavoriteChanged as EventListener);
    return () => {
      window.removeEventListener('favoriteChanged', handleFavoriteChanged as EventListener);
    };
  }, [fetchFavoriteTechStacks, fetchFavoriteCorps]);

  // Store Hooks (즐겨찾기 토글용)
  const { toggleTechFavorite, toggleCorpFavorite } = useFavoritesStore();

  // --- 기술 스택 필터링 (이미 즐겨찾기만 가져오므로 필터링만) ---
  const favoriteTechs = useMemo(() => {
    let list = [...techStacks]; // 이미 즐겨찾기만 가져왔으므로 복사만
    if (techFilter !== "all") {
      list = list.filter((t) => t.category === techFilter);
    }
    // 최신순 정렬
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [techStacks, techFilter]);

  // --- 기업 필터링 (이미 즐겨찾기만 가져왔으므로 그대로 사용) ---
  const favoriteCorps = useMemo(() => {
    return [...corps]; // 이미 즐겨찾기만 가져왔으므로 복사만
  }, [corps]);

  // 현재 탭 데이터
  const currentData = tab === "company" ? favoriteCorps : favoriteTechs;

  // 페이지네이션
  const totalPages = Math.max(1, Math.ceil(currentData.length / PAGE_SIZE));
  const pagedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return currentData.slice(start, start + PAGE_SIZE);
  }, [currentData, page]);

  // 핸들러
  const handleToggle = async (id: number) => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }

    try {
      if (tab === "company") {
        // 기업 즐겨찾기 토글
        const bookmark = corps.find(c => c.id === id);
        if (bookmark) {
          // 즐겨찾기에서 제거
          try {
            // 즐겨찾기 ID 찾기
            const bookmarksResponse = await api.get('/jobs/corp-bookmarks/');
            const bookmarks = bookmarksResponse.data.results || bookmarksResponse.data || [];
            const bookmarkToDelete = bookmarks.find((b: any) => b.corp?.id === id || b.corp_id === id);
            
            if (bookmarkToDelete) {
              await api.delete(`/jobs/corp-bookmarks/${bookmarkToDelete.corp_bookmark_id || bookmarkToDelete.id}/`);
              // 로컬 상태에서 제거
              setCorps(prev => prev.filter(c => c.id !== id));
            }
          } catch (error) {
            console.error('즐겨찾기 제거 실패:', error);
          }
        } else {
          // 즐겨찾기에 추가
          try {
            await api.post('/jobs/corp-bookmarks/', { corp_id: id });
            // 기업 정보 가져와서 추가
            const corpResponse = await api.get(`/jobs/corps/${id}/`);
            const corp = corpResponse.data;
            setCorps(prev => [...prev, {
              id: corp.id,
              name: corp.name,
              logoUrl: corp.logo_url || null,
              address: corp.address || null,
              latitude: corp.latitude || undefined,
              longitude: corp.longitude || undefined,
            }]);
          } catch (error) {
            console.error('즐겨찾기 추가 실패:', error);
          }
        }
        toggleCorpFavorite(id); // 로컬 스토어도 업데이트
      } else {
        // 기술 스택 즐겨찾기 토글
        const bookmark = techStacks.find(t => t.id === id);
        if (bookmark) {
          // 즐겨찾기에서 제거
          try {
            const bookmarksResponse = await api.get('/trends/tech-bookmarks/');
            const bookmarks = bookmarksResponse.data.results || bookmarksResponse.data || [];
            const bookmarkToDelete = bookmarks.find((b: any) => {
              const techStack = b.tech_stack || b;
              return (techStack.tech_stack_id || techStack.id) === id;
            });
            
            if (bookmarkToDelete) {
              await api.delete(`/trends/tech-bookmarks/${bookmarkToDelete.tech_bookmark_id || bookmarkToDelete.id}/`);
              // 로컬 상태에서 제거
              setTechStacks(prev => prev.filter(t => t.id !== id));
            }
          } catch (error) {
            console.error('즐겨찾기 제거 실패:', error);
          }
        } else {
          // 즐겨찾기에 추가
          try {
            await api.post('/trends/tech-bookmarks/', { tech_id: id });
            // 기술 스택 정보 가져와서 추가
            const techResponse = await api.get(`/trends/tech-stacks/${id}/`);
            const tech = techResponse.data;
            setTechStacks(prev => [...prev, {
              id: tech.id,
              name: tech.name,
              logo: tech.logo || null,
              docsUrl: tech.docs_url || null,
              createdAt: tech.created_at,
              category: undefined,
            }]);
          } catch (error) {
            console.error('즐겨찾기 추가 실패:', error);
          }
        }
        toggleTechFavorite(id); // 로컬 스토어도 업데이트
      }
    } catch (error) {
      console.error('즐겨찾기 토글 실패:', error);
    }
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
        {(isLoadingTechs || isLoadingCorps) ? (
          <div className="flex h-40 flex-col items-center justify-center rounded-xl bg-white/5 text-zinc-400 text-sm">
            <p>로딩 중...</p>
          </div>
        ) : !isLoggedIn ? (
          renderEmpty("로그인이 필요합니다.")
        ) : pagedData.length === 0 ? (
          renderEmpty("즐겨찾기한 항목이 없습니다.")
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pagedData.map((item: any) => (
              <div 
                key={item.id} 
                className={`flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-950/50 hover:border-zinc-700 transition-colors ${
                  tab === "company" ? "cursor-pointer" : ""
                }`}
                onClick={tab === "company" ? () => {
                  // 기업을 클릭하면 채용지도 페이지로 이동 (기업 ID를 쿼리 파라미터로 전달)
                  router.push(`/map?corpId=${item.id}`);
                } : undefined}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* 로고 (TechStack: logo, Corp: logoUrl - 조건부 처리) */}
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1 shrink-0 overflow-hidden">
                    <img 
                      src={tab === "company" ? item.logoUrl : item.logo} 
                      alt={item.name} 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-white truncate">{item.name}</div>
                    <div className="text-xs text-zinc-400 truncate">
                      {tab === "company" 
                        ? item.address || '주소 정보 없음' // 기업 정보
                        : `Category: ${TECH_CATEGORY_LABEL[item.category as TechFilter] || item.category || '미분류'}` // 기술 정보
                      }
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  {/* 기업일 경우 사이트 링크 버튼 */}
                  {tab === "company" && item.siteUrl && (
                    <a 
                      href={item.siteUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-1 rounded hover:bg-zinc-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Site
                    </a>
                  )}
                  {/* 기술일 경우 문서 링크 버튼 */}
                  {tab === "tech" && item.docsUrl && (
                    <a 
                      href={item.docsUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-1 rounded hover:bg-zinc-700"
                    >
                      Docs
                    </a>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(item.id);
                    }}
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