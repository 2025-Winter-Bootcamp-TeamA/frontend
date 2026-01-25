"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Map as KakaoMap, CustomOverlayMap, useKakaoLoader } from "react-kakao-maps-sdk";
import { Search, MapPin, RefreshCw, ArrowLeft, Building2, Star, Filter, X, List } from "lucide-react";
import { api } from "@/lib/api";
import { getAuthTokens } from "@/lib/auth";
import JobCard from "../home/JobCard";

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
  const [center, setCenter] = useState({ lat: 37.394776, lng: 127.11116 }); // 판교역
  const [level, setLevel] = useState(8);

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyJobs, setCompanyJobs] = useState<Job[]>([]); 
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isJobsLoading, setIsJobsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");
  const [favoriteCompanyIds, setFavoriteCompanyIds] = useState<number[]>([]);

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
    "서울특별시", "부산광역시", "대구광역시", "인천광역시", "광주광역시",
    "대전광역시", "울산광역시", "세종특별자치시", "경기도", "강원도",
    "충청북도", "충청남도", "전라북도", "전라남도", "경상북도", "경상남도", "제주특별자치도"
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

        // 전체 기업 목록 (최대 1000개)
        const response = await api.get('/jobs/corps/?page_size=1000'); 
        const rawCorps = Array.isArray(response.data) ? response.data : response.data.results || [];
        
        // 상세 좌표 정보 매핑 (필요 시)
        const detailPromises = rawCorps.map((c: any) => 
          api.get(`/jobs/corps/${c.id}/`).catch((err: any) => null)
        );
        
        const details = await Promise.all(detailPromises);
        const enriched = details
          .filter(res => res !== null && res.data)
          .map(res => {
            const d = res?.data;
            return {
              ...d,
              latitude: parseFloat(d.latitude || d.lat),
              longitude: parseFloat(d.longitude || d.lng)
            };
          })
          .filter((c: any) => !isNaN(c.latitude) && !isNaN(c.longitude) && c.latitude !== 0);

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

  // 2. 상세 필터링 (디바운스된 값 사용)
  useEffect(() => {
    const filterCompanies = async () => {
      // 필터가 모두 비어있으면 전체 목록 복원
      if (!debouncedCareer && !debouncedJobSearch && !debouncedCity && !debouncedDistrict) {
        setCompanies(allCompanies);
        return;
      }

      setIsDataLoading(true);
      try {
        // [충돌 해결] 필터 파라미터 구성 (모든 필터가 AND 조건으로 적용됨)
        const params: any = {};
        if (debouncedCareer) params.career_year = parseInt(debouncedCareer);
        if (debouncedJobSearch) params.search = debouncedJobSearch.trim();
        if (debouncedCity) params.city = debouncedCity.trim();
        if (debouncedDistrict) params.district = debouncedDistrict.trim();

        // 조건에 맞는 '채용공고' 검색
        const response = await api.get('/jobs/job-postings/', { params });
        const rawJobs = Array.isArray(response.data) ? response.data : response.data.results || [];
        
        // 해당 공고를 가진 기업 ID 추출
        const corpIds = new Set<number>();
        rawJobs.forEach((job: any) => {
          if (job.corp?.id) corpIds.add(job.corp.id);
          else if (job.corp_id) corpIds.add(job.corp_id);
        });

        // 전체 기업 중 해당 ID를 가진 기업만 필터링
        const filtered = allCompanies.filter(c => corpIds.has(c.id));
        setCompanies(filtered);
      } catch (e) {
        console.error("필터링 에러:", e);
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
  // [서버 필터 결과] -> [탭 필터] -> [클라이언트 검색어 필터]
  const finalCompanies = useMemo(() => {
    let result = companies;

    // 탭 필터 (즐겨찾기)
    if (activeTab === "favorites") {
      result = result.filter(c => favoriteCompanyIds.includes(c.id));
    }

    // 이름 검색 (클라이언트)
    if (searchQuery) {
      result = result.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
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


  // --- 핸들러 함수들 ---

  const fetchCompanyJobs = async (corpId: number) => {
    setIsJobsLoading(true);
    try {
      // 필터 조건이 있다면 기업 상세 공고 조회 시에도 적용 (선택 사항)
      const params: any = {};
      if (debouncedCareer) params.career_year = parseInt(debouncedCareer);
      if (debouncedJobSearch) params.search = debouncedJobSearch;

      const response = await api.get(`/jobs/corps/${corpId}/job-postings/`, { params });
      const rawJobs = response.data.results || response.data || [];
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

  // [충돌 해결] 메인 브랜치의 최신 로직(이벤트 발생, 토글 등) 적용 + 사이드바 열림 기능 통합

  // ✅ 기업 즐겨찾기 토글 함수 (백엔드 API 연동)
  const toggleCompanyFavorite = async (e: React.MouseEvent, corpId: number) => {
    e.stopPropagation();
    
    const { accessToken } = getAuthTokens();
    if (!accessToken) {
      // 로그인 모달 표시 (필요시 추가)
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
            // 즐겨찾기 변경 이벤트 발생
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
          // 즐겨찾기 변경 이벤트 발생
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
    if (!isSidebarOpen) setIsSidebarOpen(true); // [내 코드] 사이드바 열기 기능 유지
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

  // ✅ Navbar에서 'resetJobMap' 이벤트 시 채용 지도 첫 화면으로 복귀
  const DEFAULT_CENTER = { lat: 37.496, lng: 127.029 };
  const DEFAULT_LEVEL = 8;
  useEffect(() => {
    const handleReset = () => {
      setSelectedCompany(null);
      setCompanyJobs([]);
      resetFilters();
      setSearchQuery("");
      setShowFilters(false);
      setCenter(DEFAULT_CENTER);
      setLevel(DEFAULT_LEVEL);
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
                                <label className="block text-xs text-gray-400 mb-1">직무 키워드</label>
                                <input type="text" value={jobSearch} onChange={(e) => setJobSearch(e.target.value)} className="w-full bg-[#25262B] text-white px-2 py-1.5 rounded border border-white/10 text-sm focus:border-blue-500 outline-none" />
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
                                    <h2 className="text-lg font-bold text-white truncate">{selectedCompany.name}</h2>
                                    <button onClick={(e) => toggleCompanyFavorite(e, selectedCompany.id)}>
                                        <Star size={20} fill={favoriteCompanyIds.includes(selectedCompany.id) ? "#EAB308" : "none"} className={favoriteCompanyIds.includes(selectedCompany.id) ? "text-yellow-500" : "text-gray-500"} />
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 mt-1 flex items-start gap-1 break-keep">
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
                                <JobCard key={job.id} id={job.id} company={selectedCompany.name} logo={selectedCompany.logo_url} position={job.title} url={job.url} deadline={job.deadline} />
                            ))
                        )}
                    </div>
                </div>
            ) : (
                // (2) 기업 목록 (최종 리스트)
                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1 mb-4">
                        <p className="text-[10px] font-bold text-gray-500 uppercase">
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
                                    <h3 className="font-bold text-white text-sm truncate group-hover:text-blue-400 transition-colors">{company.name}</h3>
                                    <p className="text-[11px] text-gray-500 mt-0.5 truncate">{company.address}</p>
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
                setCenter({ lat: map.getCenter().getLat(), lng: map.getCenter().getLng() });
                updateVisibleCompanies(); // 화면 이동 시 마커 갱신
            }}
        >
          {visibleCompanies.map((company) => (
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