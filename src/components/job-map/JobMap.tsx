"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Map as KakaoMap, CustomOverlayMap, useKakaoLoader } from "react-kakao-maps-sdk";
import { Search, MapPin, RefreshCw, ArrowLeft, Building2, Star, Filter, X, List } from "lucide-react";
import { api } from "@/lib/api";
import { getAuthTokens } from "@/lib/auth";
import JobCard from "../home/JobCard";

// 서울 영등포구 — 채용 지도 첫 화면·리셋 시 고정
const SEOUL_CENTER = { lat: 37.5172, lng: 126.9074 };
const INITIAL_MAP_LEVEL = 8; // 한강·강남·서초·용산 등 넓은 서울 뷰 (레벨↑=축소)

// --- 커스텀 훅: 디바운스 (입력 지연 처리) ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// --- 데이터 타입 정의 ---
interface Job {
  id: number;
  title: string;
  url: string;
  deadline: string | null;
}

interface Company {
  id: number;
  name: string;
  logo_url: string; 
  address: string;
  latitude: number;  
  longitude: number; 
}

export default function JobMap() {
  const searchParams = useSearchParams();
  const [loading, error] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_KEY as string,
    libraries: ["clusterer", "services"],
  });

  // --- 상태 관리 ---
  const [allCompanies, setAllCompanies] = useState<Company[]>([]); // 원본 전체 데이터
  const [companies, setCompanies] = useState<Company[]>([]); // 서버 필터링된 데이터
  const [visibleCompanies, setVisibleCompanies] = useState<Company[]>([]); // 화면에 렌더링할 데이터
  
  const [map, setMap] = useState<kakao.maps.Map | null>(null);
  const [center, setCenter] = useState(SEOUL_CENTER);
  const [level, setLevel] = useState(INITIAL_MAP_LEVEL);

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyJobs, setCompanyJobs] = useState<Job[]>([]); 
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isJobsLoading, setIsJobsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");
  const [favoriteCompanyIds, setFavoriteCompanyIds] = useState<number[]>([]);
  const hasMapIdleFired = useRef(false);

  // --- 필터 상태 ---
  const [searchQuery, setSearchQuery] = useState(""); // 클라이언트 사이드 (기업명)
  const [careerYear, setCareerYear] = useState<string>(""); // 서버 사이드
  const [jobSearch, setJobSearch] = useState<string>(""); // 서버 사이드
  const [city, setCity] = useState<string>(""); // 서버 사이드
  const [district, setDistrict] = useState<string>(""); // 서버 사이드
  const [showFilters, setShowFilters] = useState(false);

  // ✅ 디바운스 적용된 필터 값 (API 요청 최적화용)
  const debouncedCareer = useDebounce(careerYear, 500);
  const debouncedJobSearch = useDebounce(jobSearch, 500);
  const debouncedCity = useDebounce(city, 500);
  const debouncedDistrict = useDebounce(district, 500);

  const cities = [
    "서울", "부산", "대구", "인천", "광주",
    "대전", "울산", "세종", "경기", "강원",
    "충북", "충남", "전북", "전남", "경북", "경남", "제주"
    ];

  // 1. 초기 데이터 로드
  useEffect(() => {
    const fetchAllData = async () => {
      setIsDataLoading(true);
      try {
        // 즐겨찾기 목록
        const { accessToken } = getAuthTokens();
        if (accessToken) {
          try {
            const bookmarksResponse = await api.get('/jobs/corp-bookmarks/');
            const bookmarks = bookmarksResponse.data.results || bookmarksResponse.data || [];
            const favoriteIds = bookmarks.map((b: any) => b.corp?.id || b.corp_id);
            setFavoriteCompanyIds(favoriteIds);
          } catch (error: any) {
            console.error('즐겨찾기 로드 실패:', error);
          }
        }

        // 전체 기업 목록 (목록 API에 latitude/longitude 포함 → 상세 N회 호출 제거)
        const response = await api.get('/jobs/corps/?page_size=1000');
        const rawCorps = Array.isArray(response.data) ? response.data : response.data.results || [];
        const enriched = rawCorps
          .map((c: any) => ({
            ...c,
            latitude: parseFloat(c.latitude ?? c.lat ?? '0'),
            longitude: parseFloat(c.longitude ?? c.lng ?? '0')
          }))
          .filter((c: any) => !isNaN(c.latitude) && !isNaN(c.longitude) && c.latitude !== 0 && c.longitude !== 0);

        setAllCompanies(enriched);
        setCompanies(enriched);

      } catch (e: any) {
        console.error("데이터 로드 에러:", e);
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // 2. 상세 필터링: 경력·직무·지역을 한 번에 쿼리 → 백엔드가 AND 조건으로 교집합만 반환
  //    (경력·직무·지역 모두 검색값이 있을 때, 세 조건을 **동시에** 만족하는 채용공고만 사용)
  useEffect(() => {
    const filterCompanies = async () => {
      if (!debouncedCareer && !debouncedJobSearch && !debouncedCity && !debouncedDistrict) {
        setCompanies(allCompanies);
        return;
      }

      setIsDataLoading(true);
      // 주어진 값만 params에 넣고, 한 요청으로 전달 → 백엔드에서 모두 만족(AND)하는 공고만 반환
      const apiParams: Record<string, number | string> = {};
      const year = parseInt(debouncedCareer, 10);
      if (debouncedCareer !== "" && !isNaN(year) && year >= 0) apiParams.career_year = year;
      if (debouncedJobSearch?.trim()) apiParams.job_title = debouncedJobSearch.trim();
      if (debouncedCity?.trim()) apiParams.city = debouncedCity.trim();
      if (debouncedDistrict?.trim()) apiParams.district = debouncedDistrict.trim();
      apiParams.page_size = 5000; // AND 조건에 맞는 공고를 넉넉히 수집해 기업 목록 구성

      try {
        const res = await api.get("/jobs/job-postings/", { params: apiParams });
        const raw = Array.isArray(res.data) ? res.data : res.data?.results || [];
        const corpIds = new Set(raw.map((j: any) => j.corp?.id ?? j.corp_id).filter(Boolean).map(Number));
        const filtered = allCompanies.filter((c) => corpIds.has(c.id));
        setCompanies(filtered);
      } catch (e) {
        console.error("상세 필터 API 에러:", e);
        setCompanies([]);
      } finally {
        setIsDataLoading(false);
      }
    };

    if (allCompanies.length > 0) {
      filterCompanies();
    }
  }, [debouncedCareer, debouncedJobSearch, debouncedCity, debouncedDistrict, allCompanies]);

  // 3. 최종 리스트 계산 (메모이제이션)
  const finalCompanies = useMemo(() => {
    let result = companies;

    // 탭 필터 (즐겨찾기)
    if (activeTab === "favorites") {
      result = result.filter(c => favoriteCompanyIds.includes(c.id));
    }

    // 이름 검색 (클라이언트)
    if (searchQuery) {
      result = result.filter(c => 
        c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result;
  }, [companies, activeTab, favoriteCompanyIds, searchQuery]);

  // 4. 지도 뷰포트 내 마커 필터링 (렌더링 최적화)
  const updateVisibleCompanies = useCallback(() => {
    if (!map) return;

    const bounds = map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    // 최종 리스트 중에서 화면 안에 있는 것만 추출
    const visible = finalCompanies.filter((company) => {
      return (
        company.latitude >= sw.getLat() &&
        company.latitude <= ne.getLat() &&
        company.longitude >= sw.getLng() &&
        company.longitude <= ne.getLng()
      );
    });

    setVisibleCompanies(visible);
  }, [map, finalCompanies]);

  // 리스트나 맵 변경 시 마커 갱신
  useEffect(() => {
    updateVisibleCompanies();
  }, [finalCompanies, updateVisibleCompanies]);

  // 선택한 기업이 현재 뷰 밖이어도 마커에 항상 포함 (클릭 시 위치 미표시 방지)
  const companiesToShow = useMemo(() => {
    if (!selectedCompany) return visibleCompanies;
    const lat = Number(selectedCompany.latitude);
    const lng = Number(selectedCompany.longitude);
    const hasValidCoords = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
    if (!hasValidCoords) return visibleCompanies;
    const alreadyIn = visibleCompanies.some((c) => c.id === selectedCompany.id);
    return alreadyIn ? visibleCompanies : [selectedCompany, ...visibleCompanies];
  }, [visibleCompanies, selectedCompany]);

  // 선택 시 지도 중심·줌을 해당 기업 좌표로 이동 (state만으로는 미반영될 수 있어 map API 직접 호출)
  useEffect(() => {
    if (!map || !selectedCompany) return;
    const lat = Number(selectedCompany.latitude);
    const lng = Number(selectedCompany.longitude);
    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return;
    const kakao = typeof window !== 'undefined' ? (window as any).kakao : null;
    if (kakao?.maps?.LatLng) {
      map.setCenter(new kakao.maps.LatLng(lat, lng));
      map.setLevel(3);
    }
  }, [map, selectedCompany]);

  // --- 핸들러 함수들 ---

  const fetchCompanyJobs = async (corpId: number) => {
    setIsJobsLoading(true);
    try {
      const params: Record<string, number | string> = {};
      const year = parseInt(careerYear, 10);
      if (careerYear !== "" && !isNaN(year) && year >= 0) params.career_year = year;
      if (jobSearch?.trim()) params.job_title = jobSearch.trim();
      if (city?.trim()) params.city = city.trim();
      if (district?.trim()) params.district = district.trim();

      const response = await api.get(`/jobs/corps/${corpId}/job-postings/`, { params });
      const rawJobs = response.data?.results || response.data || [];
      setCompanyJobs(rawJobs.map((j: any) => ({
        id: j.id,
        title: j.title,
        url: j.url,
        deadline: j.expiry_date
      })));
    } catch (e) {
      setCompanyJobs([]);
    } finally {
      setIsJobsLoading(false);
    }
  };

  const resetFilters = () => {
    setCareerYear("");
    setJobSearch("");
    setCity("");
    setDistrict("");
  };
  
  const hasActiveFilters = careerYear !== "" || jobSearch !== "" || city !== "" || district !== "";

  // ✅ 기업 즐겨찾기 토글 함수 (백엔드 API 연동)
  const toggleCompanyFavorite = async (e: React.MouseEvent, corpId: number) => {
    e.stopPropagation();
    
    const { accessToken } = getAuthTokens();
    if (!accessToken) {
      // 로그인 모달 표시 로직 필요
      return;
    }

    try {
      const isFavorite = favoriteCompanyIds.includes(corpId);
      
      if (isFavorite) {
        // 즐겨찾기 제거
        try {
          const bookmarksResponse = await api.get('/jobs/corp-bookmarks/');
          const bookmarks = bookmarksResponse.data.results || bookmarksResponse.data || [];
          const bookmarkToDelete = bookmarks.find((b: any) => b.corp?.id === corpId || b.corp_id === corpId);
          
          if (bookmarkToDelete) {
            await api.delete(`/jobs/corp-bookmarks/${bookmarkToDelete.corp_bookmark_id || bookmarkToDelete.id}/`);
            const nextFavs = favoriteCompanyIds.filter(id => id !== corpId);
            setFavoriteCompanyIds(nextFavs);
            window.dispatchEvent(new CustomEvent('favoriteChanged', { detail: { type: 'company', action: 'removed', id: corpId } }));
          }
        } catch (error) {
          console.error('즐겨찾기 제거 실패:', error);
        }
      } else {
        // 즐겨찾기 추가
        try {
          await api.post('/jobs/corp-bookmarks/', { corp_id: corpId });
          const nextFavs = [...favoriteCompanyIds, corpId];
          setFavoriteCompanyIds(nextFavs);
          window.dispatchEvent(new CustomEvent('favoriteChanged', { detail: { type: 'company', action: 'added', id: corpId } }));
        } catch (error) {
          console.error('즐겨찾기 추가 실패:', error);
        }
      }
    } catch (error) {
      console.error('즐겨찾기 토글 실패:', error);
    }
  };

  const handleSelectCompany = (company: Company) => {
    setSelectedCompany(company);
    setCenter({ lat: Number(company.latitude), lng: Number(company.longitude) });
    setLevel(3);
    fetchCompanyJobs(company.id);
    if (!isSidebarOpen) setIsSidebarOpen(true); 
  };
  
  const handleBackToList = () => {
    setSelectedCompany(null);
    resetFilters();
  };

  // ✅ URL 파라미터에서 기업 ID를 받아서 해당 기업을 자동 선택
  useEffect(() => {
    const corpIdParam = searchParams?.get('corpId');
    if (corpIdParam && companies.length > 0) {
      const corpId = parseInt(corpIdParam, 10);
      if (!isNaN(corpId)) {
        const company = companies.find(c => c.id === corpId);
        if (company && (!selectedCompany || selectedCompany.id !== corpId)) {
          handleSelectCompany(company);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, companies]);

  // ✅ Navbar에서 'resetJobMap' 이벤트 시 채용 지도 첫 화면(서울 중심)으로 복귀
  useEffect(() => {
    const handleReset = () => {
      setSelectedCompany(null);
      setCompanyJobs([]);
      resetFilters();
      setSearchQuery("");
      setShowFilters(false);
      setCenter(SEOUL_CENTER);
      setLevel(INITIAL_MAP_LEVEL);
    };
    window.addEventListener("resetJobMap", handleReset);
    return () => window.removeEventListener("resetJobMap", handleReset);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (finalCompanies.length > 0) {
      handleSelectCompany(finalCompanies[0]);
    } else {
      alert("검색 결과가 없습니다.");
    }
  };

  if (loading) return <div className="w-full h-screen bg-[#1A1B1E] flex items-center justify-center text-white">지도를 로드 중...</div>;

  return (
    <div className="flex flex-col lg:flex-row w-full h-full bg-[#1A1B1E] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl relative">
      
      {/* 🔴 사이드바 */}
      <div 
        className={`absolute left-0 top-0 h-full w-full md:w-[400px] bg-[#25262B] z-20 transition-transform duration-300 shadow-2xl flex flex-col border-r border-white/5 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="bg-[#2C2E33] flex-shrink-0">
            {/* 헤더 */}
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-xl font-black text-white">채용 지도</h2>
                <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-gray-400">
                    <X size={20} />
                </button>
            </div>

            {/* 검색 및 필터 패널 */}
            <div className="p-4 pb-0">
                <form onSubmit={handleSearchSubmit} className="relative mb-3">
                    <input 
                        type="text" placeholder="기업명 검색..." 
                        value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#1A1B1E] text-white pl-10 pr-4 py-3 rounded-xl border border-white/10 outline-none text-sm focus:border-blue-500 transition-colors"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                </form>
                
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`w-full flex items-center justify-between p-3 border border-white/10 rounded-xl transition-all mb-4 ${showFilters ? "bg-[#1A1B1E] border-blue-500/50" : "bg-[#1A1B1E] hover:border-white/30"}`}
                >
                    <div className="flex items-center gap-2">
                        <Filter size={16} className={showFilters ? "text-blue-400" : "text-gray-400"} />
                        <span className="text-sm font-medium text-white">상세 필터</span>
                        {hasActiveFilters && (
                            <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] rounded-full">ON</span>
                        )}
                    </div>
                    {hasActiveFilters && (
                        <div onClick={(e) => { e.stopPropagation(); resetFilters(); }} className="text-xs text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer">
                            <X size={12} /> 초기화
                        </div>
                    )}
                </button>

                {/* 상세 필터 입력 폼 */}
                {showFilters && (
                    <div className="p-4 bg-[#1A1B1E] border border-white/10 rounded-xl space-y-3 mb-4 animate-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">경력(년)</label>
                                <input type="number" min="0" value={careerYear} onChange={(e) => setCareerYear(e.target.value)} className="w-full bg-[#25262B] text-white px-2 py-1.5 rounded border border-white/10 text-sm focus:border-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">직무 분야</label>
                                <input type="text" value={jobSearch} onChange={(e) => setJobSearch(e.target.value)} placeholder="공고 제목 검색" className="w-full bg-[#25262B] text-white px-2 py-1.5 rounded border border-white/10 text-sm focus:border-blue-500 outline-none" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">시/도</label>
                                <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-[#25262B] text-white px-2 py-1.5 rounded border border-white/10 text-sm focus:border-blue-500 outline-none">
                                    <option value="">전체</option>
                                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">구/군</label>
                                <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full bg-[#25262B] text-white px-2 py-1.5 rounded border border-white/10 text-sm focus:border-blue-500 outline-none" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 탭 (전체 / 즐겨찾기) */}
            <div className="flex border-b border-white/10 px-4">
                <button
                    onClick={() => { setActiveTab("all"); setSelectedCompany(null); }}
                    className={`flex-1 pb-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                        activeTab === "all" ? "border-blue-500 text-white" : "border-transparent text-gray-500 hover:text-gray-300"
                    }`}
                >
                    <List size={16} />
                    전체 ({companies.length})
                </button>
                <button
                    onClick={() => { setActiveTab("favorites"); setSelectedCompany(null); }}
                    className={`flex-1 pb-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                        activeTab === "favorites" ? "border-yellow-500 text-white" : "border-transparent text-gray-500 hover:text-gray-300"
                    }`}
                >
                    <Star size={16} fill={activeTab === "favorites" ? "currentColor" : "none"} />
                    즐겨찾기 ({favoriteCompanyIds.length})
                </button>
            </div>
        </div>

        {/* 리스트 영역 */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-[#1e1f23]">
            {isDataLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                    <span>데이터를 불러오는 중...</span>
                </div>
            ) : selectedCompany ? (
                // (1) 기업 상세 보기
                <div className="animate-in slide-in-from-right duration-200">
                    <button onClick={() => setSelectedCompany(null)} className="flex items-center gap-2 text-gray-400 hover:text-white text-xs mb-3">
                        <ArrowLeft size={14} /> 목록으로 돌아가기
                    </button>
                    <div className="bg-[#25262B] p-4 rounded-xl border border-white/10 mb-4">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center p-2 shrink-0">
                                {selectedCompany.logo_url ? <img src={selectedCompany.logo_url} alt={selectedCompany.name} className="object-contain w-full h-full" /> : <Building2 className="text-gray-400 w-8 h-8" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-base font-bold text-white truncate">{selectedCompany.name}</h2>
                                    <button onClick={(e) => toggleCompanyFavorite(e, selectedCompany.id)}>
                                        <Star size={20} fill={favoriteCompanyIds.includes(selectedCompany.id) ? "#EAB308" : "none"} className={favoriteCompanyIds.includes(selectedCompany.id) ? "text-yellow-500" : "text-gray-500"} />
                                    </button>
                                </div>
                                <p className="text-[11px] text-gray-400 mt-1 flex items-start gap-1 break-keep">
                                    <MapPin size={12} className="shrink-0 mt-0.5" />
                                    {selectedCompany.address}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-300 px-1">진행 중인 공고 {companyJobs.length}건</h3>
                        {isJobsLoading ? (
                            <div className="text-center py-8 text-gray-500">공고 로딩 중...</div>
                        ) : companyJobs.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 bg-[#25262B] rounded-xl border border-white/5">
                                {hasActiveFilters ? "조건에 맞는 채용공고가 없습니다." : "등록된 공고가 없습니다."}
                            </div>
                        ) : (
                            companyJobs.map(job => (
                                <JobCard key={job.id} id={job.id} company={selectedCompany.name} logo={selectedCompany.logo_url} position={job.title} url={job.url} deadline={job.deadline} compact />
                            ))
                        )}
                    </div>
                </div>
            ) : (
                // (2) 기업 목록 (최종 리스트)
                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1 mb-4">
                        <p className="text-xs font-bold text-gray-500 uppercase">
                            {/* 현재 보여지는 리스트의 개수 */}
                            {activeTab === "favorites" ? "즐겨찾기 기업" : "검색 결과"} ({finalCompanies.length})
                        </p>
                    </div>
                    
                    {finalCompanies.length === 0 ? (
                        <div className="text-center py-20 text-gray-500 flex flex-col items-center gap-3">
                            <Building2 size={40} strokeWidth={1} />
                            <p>
                                {activeTab === "favorites" ? "즐겨찾기한 기업이 없습니다." : "조건에 맞는 기업이 없습니다."}
                            </p>
                        </div>
                    ) : (
                        // 부하 방지를 위해 상위 100개만 렌더링
                        finalCompanies.slice(0, 100).map(company => (
                            <div 
                                key={company.id} 
                                onClick={() => handleSelectCompany(company)}
                                className="group p-4 bg-[#25262B] border border-white/5 hover:border-blue-500/50 hover:bg-[#2C2E33] rounded-2xl cursor-pointer flex items-center gap-4 transition-all"
                            >
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1.5 shrink-0 shadow-sm">
                                    {company.logo_url ? <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain" /> : <Building2 className="text-gray-400 w-5 h-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-white text-base truncate group-hover:text-blue-400 transition-colors">{company.name}</h3>
                                    <p className="text-xs text-gray-500 mt-0.5 truncate">{company.address}</p>
                                </div>
                                <button
                                    onClick={(e) => toggleCompanyFavorite(e, company.id)}
                                    className="shrink-0 p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <Star 
                                        size={16} 
                                        fill={favoriteCompanyIds.includes(company.id) ? "#EAB308" : "none"} 
                                        className={favoriteCompanyIds.includes(company.id) ? "text-yellow-500" : "text-gray-600"} 
                                    />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
      </div>

      {/* 🔵 지도 영역 */}
      <div className="flex-1 relative bg-gray-900 w-full h-full">
        {!isSidebarOpen && (
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className="absolute left-4 top-4 z-10 bg-[#25262B] text-white p-3 rounded-xl shadow-lg border border-white/10 hover:bg-[#2C2E33]"
            >
                <List size={24} />
            </button>
        )}

        <KakaoMap 
            center={center} 
            style={{ width: "100%", height: "100%" }} 
            level={level} 
            onCreate={setMap}
            // 데이터 로딩 중 지도 조작 방지
            draggable={!isDataLoading}
            zoomable={!isDataLoading}
            onZoomChanged={(map) => setLevel(map.getLevel())}
            onIdle={(map) => {
                // 첫 onIdle에서는 setCenter 생략 → 서울 중심 고정값이 SDK 기본값으로 덮이지 않음
                if (hasMapIdleFired.current) {
                    setCenter({ lat: map.getCenter().getLat(), lng: map.getCenter().getLng() });
                } else {
                    hasMapIdleFired.current = true;
                }
                updateVisibleCompanies(); // 화면 이동 시 마커 갱신
            }}
        >
          {companiesToShow.map((company) => (
            <CustomOverlayMap 
                key={company.id} 
                position={{ lat: company.latitude, lng: company.longitude }} 
                yAnchor={0.5}
                zIndex={selectedCompany?.id === company.id ? 20 : 1}
            >
                <div 
                    onClick={(e) => { e.stopPropagation(); handleSelectCompany(company); }} 
                    className="relative cursor-pointer group"
                >
                    <div className="flex flex-col items-center">
                        {/* 기업명 툴팁 */}
                        <div className={`px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/20 flex items-center gap-1 shadow-md ${selectedCompany?.id === company.id ? "opacity-100 bg-blue-600 border-blue-400" : ""}`}>
                            {favoriteCompanyIds.includes(company.id) && <Star size={10} fill="#EAB308" className="text-yellow-500" />}
                            {company.name}
                        </div>

                        {/* 마커 디자인 */}
                        {level >= 6 ? (
                            /* 줌아웃 시: 파란색/노란색 점 (테두리 없음) */
                            <div className={`w-3 h-3 rounded-full shadow-lg transition-all ${favoriteCompanyIds.includes(company.id) ? "bg-yellow-500 scale-125" : "bg-blue-600"}`} />
                        ) : (
                            /* 줌인 시: 로고 마커 (줌아웃 점과 동일한 파란색 테두리) */
                            <>
                                <div className={`w-10 h-10 rounded-full border-2 border-blue-600 shadow-xl flex items-center justify-center bg-white transition-all duration-300 ${selectedCompany?.id === company.id ? "!border-blue-500 scale-125 ring-4 ring-blue-500/20" : ""}`}>
                                    {company.logo_url ? <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain rounded-full p-1.5" /> : <Building2 size={16} className="text-gray-400" />}
                                </div>
                                <div className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] -mt-0.5 transition-colors ${selectedCompany?.id === company.id ? "border-t-blue-500" : "border-t-blue-600"}`} />
                            </>
                        )}
                    </div>
                </div>
            </CustomOverlayMap>
          ))}
        </KakaoMap>
      </div>
    </div>
  );
}