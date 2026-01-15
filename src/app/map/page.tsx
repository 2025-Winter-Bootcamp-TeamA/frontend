"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Star } from "lucide-react";
import { mockCompanies, getCompaniesByArea } from "./_models/companies.mock";
import type { Company, LocationArea } from "./_models/companies.types";
import { useCompanyFavoritesStore } from "@/store/companyFavoritesStore";

export default function JobMapPage() {
  const [selectedArea, setSelectedArea] = useState<LocationArea>("강남");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [mapZoom, setMapZoom] = useState(1);
  const [mapCenter, setMapCenter] = useState({ x: 0, y: 0 });
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);

  // 즐겨찾기 store (전체 상태 구독)
  const favoriteCompanyIdsSet = useCompanyFavoritesStore((state) => state.favoriteCompanyIds);
  const favoriteCompanyIdsArray = Array.from(favoriteCompanyIdsSet); // 의존성 배열용
  const { isFavorite, toggleFavorite } = useCompanyFavoritesStore();

  // 지역별 회사 필터링 (즐겨찾기 상태 포함)
  const areaCompanies = useMemo(() => {
    return getCompaniesByArea(selectedArea).map((company) => ({
      ...company,
      isFavorite: isFavorite(company.id),
    }));
  }, [selectedArea, favoriteCompanyIdsArray, isFavorite]); // favoriteCompanyIdsArray 변경 시 재계산

  // 검색 필터링
  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return areaCompanies;
    const query = searchQuery.toLowerCase();
    return areaCompanies.filter(
      (company) =>
        company.name.toLowerCase().includes(query) ||
        company.industry.toLowerCase().includes(query)
    );
  }, [areaCompanies, searchQuery]);

  // 즐겨찾기 회사 목록 (현재 선택된 지역의 즐겨찾기 회사만)
  const favoriteCompanies = useMemo(() => {
    return filteredCompanies.filter((c) => isFavorite(c.id));
  }, [filteredCompanies, favoriteCompanyIdsArray, isFavorite]); // favoriteCompanyIdsArray 변경 시 재계산

  // "여기는 어때요?" 제안 (즐겨찾기 아닌 회사 중 최대 4개)
  const suggestedCompanies = useMemo(() => {
    const nonFavorite = filteredCompanies.filter((c) => !isFavorite(c.id));
    return nonFavorite.slice(0, 4);
  }, [filteredCompanies, favoriteCompanyIdsArray, isFavorite]); // favoriteCompanyIdsArray 변경 시 재계산

  // 즐겨찾기 토글
  const handleToggleFavorite = (company: Company, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    toggleFavorite(company.id);
    // store 업데이트로 인해 자동으로 리렌더링됨
  };

  // 지도 확대/축소
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setMapZoom((prev) => Math.max(0.5, Math.min(2, prev + delta)));
  };

  // 회사 클릭 핸들러
  const handleCompanyClick = (company: Company) => {
    setSelectedCompany((prev) => (prev?.id === company.id ? null : company));
  };

  return (
    <div className="flex h-[calc(100vh-70px)] w-full bg-[#1A1B1E] text-white overflow-hidden">
      {/* 왼쪽 사이드바 */}
      <aside className="w-[400px] bg-[#212226] border-r border-white/10 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">채용 지도</h1>

        {/* 지역 선택 드롭다운 */}
        <div className="mb-4">
          <select
            value={selectedArea}
            onChange={(e) => {
              setSelectedArea(e.target.value as LocationArea);
              setSearchQuery("");
              setSelectedCompany(null);
            }}
            className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="강남">강남</option>
            <option value="판교">판교</option>
          </select>
        </div>

        {/* 검색 바 */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="찾고 싶은 기업을 검색하세요...."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* 즐겨찾기 섹션 */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-zinc-300 mb-3">즐겨찾기</h2>
          {favoriteCompanies.length === 0 ? (
            <p className="text-xs text-zinc-500">아직 아무것도 없네요</p>
          ) : (
            <div className="space-y-2">
              {favoriteCompanies.map((company) => (
                <div
                  key={company.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 hover:bg-zinc-800 cursor-pointer"
                  onClick={() => handleCompanyClick(company)}
                >
                  <img
                    src={company.logoUrl}
                    alt={company.name}
                    className="w-10 h-10 rounded-lg object-contain bg-white p-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://ui-avatars.com/api/?name=" +
                        company.name +
                        "&background=3b82f6&color=fff";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {company.name}
                    </p>
                    <p className="text-xs text-zinc-400">{company.industry}</p>
                  </div>
                  <button
                    onClick={(e) => handleToggleFavorite(company, e)}
                    className="text-yellow-400 hover:text-yellow-300"
                  >
                    <Star size={16} fill="currentColor" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 여기는 어때요? 섹션 */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-300 mb-3">
            여기는 어때요?
          </h2>
          <div className="space-y-2">
            {suggestedCompanies.map((company) => (
              <div
                key={company.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 hover:bg-zinc-800 cursor-pointer"
                onClick={() => handleCompanyClick(company)}
              >
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="w-10 h-10 rounded-lg object-contain bg-white p-1"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://ui-avatars.com/api/?name=" +
                      company.name +
                      "&background=3b82f6&color=fff";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {company.name}
                  </p>
                  <p className="text-xs text-zinc-400">{company.industry}</p>
                </div>
                <button
                  onClick={(e) => handleToggleFavorite(company, e)}
                  className={`${
                    company.isFavorite
                      ? "text-yellow-400"
                      : "text-zinc-500 hover:text-yellow-400"
                  }`}
                >
                  <Star
                    size={16}
                    fill={company.isFavorite ? "currentColor" : "none"}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 하단 크레딧 */}
        <p className="mt-8 text-xs text-zinc-600 text-center">
          By Naver 지도 API
        </p>
      </aside>

      {/* 오른쪽 지도 영역 */}
      <main
        className="flex-1 relative bg-zinc-900 overflow-hidden"
        onWheel={handleWheel}
      >
        {/* 간단한 지도 배경 (SVG 또는 Canvas로 구현 가능) */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-800">
          {/* 지도 그리드 패턴 */}
          <svg className="w-full h-full opacity-20">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* 회사 마커 (강남 + 판교 모든 회사 표시) */}
          {mockCompanies.map((company) => {
            // 모든 회사의 즐겨찾기 상태 반영
            const companyWithFavorite = {
              ...company,
              isFavorite: isFavorite(company.id),
            };
            
            // 선택된 지역이 아니면 반투명하게 표시
            const isInSelectedArea = company.area === selectedArea;
            // 강남 기준: 37.36 ~ 37.37, 127.10 ~ 127.11
            // 판교 기준: 37.39 ~ 37.40, 127.11 ~ 127.12
            const baseLat = company.area === "강남" ? 37.36 : 37.39;
            const baseLng = company.area === "강남" ? 127.10 : 127.11;
            const latRange = 0.01;
            const lngRange = 0.01;
            
            const latPercent = ((company.latitude - baseLat) / latRange) * 100;
            const lngPercent = ((company.longitude - baseLng) / lngRange) * 100;
            
            // 강남은 왼쪽, 판교는 오른쪽에 배치
            const leftOffset = company.area === "강남" ? 20 : 60;
            
            return (
            <button
              key={company.id}
              onClick={() => handleCompanyClick(companyWithFavorite)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110 z-10 ${
                !isInSelectedArea ? "opacity-40" : ""
              }`}
              style={{
                left: `${leftOffset + lngPercent * 0.3}%`,
                top: `${20 + latPercent * 0.6}%`,
                transform: `translate(-50%, -50%) scale(${mapZoom})`,
              }}
            >
              <div className="relative">
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    selectedCompany?.id === company.id
                      ? "bg-blue-500 border-blue-300 scale-150"
                      : companyWithFavorite.isFavorite
                      ? "bg-yellow-500 border-yellow-400"
                      : "bg-blue-600 border-blue-400"
                  } transition-all`}
                />
                {selectedCompany?.id === company.id && (
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700 rounded-lg p-3 min-w-[200px] shadow-xl z-10">
                    <p className="font-semibold text-white mb-1">
                      {companyWithFavorite.name}
                    </p>
                    <p className="text-xs text-zinc-400 mb-2">
                      {companyWithFavorite.industry}
                    </p>
                    <button className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-xs font-medium text-white transition-colors">
                      채용 정보 보기
                    </button>
                  </div>
                )}
              </div>
            </button>
            );
          })}
        </div>

        {/* 하단 오버레이 제거: "채용 정보 보기" 버튼 중복 방지 */}
      </main>
    </div>
  );
}
