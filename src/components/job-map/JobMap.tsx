"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Map as KakaoMap, CustomOverlayMap, useKakaoLoader } from "react-kakao-maps-sdk";
import { Search, MapPin, RefreshCw, ArrowLeft, Building2, Star, Filter, X } from "lucide-react";
import { api } from "@/lib/api";
import { getAuthTokens } from "@/lib/auth";
import JobCard from "../home/JobCard";

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

  const [allCompanies, setAllCompanies] = useState<Company[]>([]); // 전체 기업 목록
  const [companies, setCompanies] = useState<Company[]>([]); // 필터링된 기업 목록
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyJobs, setCompanyJobs] = useState<Job[]>([]); 
  
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isJobsLoading, setIsJobsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // ✅ 필터 상태
  const [careerYear, setCareerYear] = useState<string>("");
  const [jobSearch, setJobSearch] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  
  // ✅ 기업 즐겨찾기 상태 (Company ID 리스트)
  const [favoriteCompanyIds, setFavoriteCompanyIds] = useState<number[]>([]);
  
  const [center, setCenter] = useState({ lat: 37.496, lng: 127.029 }); 
  const [level, setLevel] = useState(8);
  
  // 한국 주요 시/도 목록
  const cities = [
    "서울특별시", "부산광역시", "대구광역시", "인천광역시", "광주광역시",
    "대전광역시", "울산광역시", "세종특별자치시", "경기도", "강원도",
    "충청북도", "충청남도", "전라북도", "전라남도", "경상북도", "경상남도", "제주특별자치도"
  ]; 

  // 1. 초기 로드: 모든 기업 및 기업 즐겨찾기 로드
  useEffect(() => {
    const fetchAllData = async () => {
      setIsDataLoading(true);
      try {
        // ✅ 백엔드에서 즐겨찾기 목록 가져오기
        const { accessToken } = getAuthTokens();
        if (accessToken) {
          try {
            const bookmarksResponse = await api.get('/jobs/corp-bookmarks/');
            const bookmarks = bookmarksResponse.data.results || bookmarksResponse.data || [];
            const favoriteIds = bookmarks.map((b: any) => b.corp?.id || b.corp_id);
            setFavoriteCompanyIds(favoriteIds);
          } catch (error) {
            console.error('즐겨찾기 목록 불러오기 실패:', error);
          }
        }

        const response = await api.get('/jobs/corps/'); 
        const rawCorps = Array.isArray(response.data) ? response.data : response.data.results || [];
        
        // 모든 기업의 상세 좌표를 병렬로 호출
        const detailPromises = rawCorps.map((c: any) => 
          api.get(`/jobs/corps/${c.id}/`).catch(() => null)
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
        if (enriched.length > 0) {
          setCenter({ lat: enriched[0].latitude, lng: enriched[0].longitude });
        }
      } catch (e) {
        console.error("데이터 로드 에러:", e);
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // 2. 필터 조건에 맞는 채용공고가 있는 기업만 필터링
  useEffect(() => {
    const filterCompanies = async () => {
      // 필터가 하나도 없으면 전체 기업 표시
      if (!careerYear && !jobSearch && !city && !district) {
        setCompanies(allCompanies);
        return;
      }

      setIsDataLoading(true);
      try {
       // 필터 파라미터 구성 (모든 필터가 AND 조건으로 적용됨)
        const params: any = {};
        if (careerYear && careerYear.trim() !== "") {
          const careerValue = parseInt(careerYear);
          if (!isNaN(careerValue)) {
            params.career_year = careerValue;
          }
        }
        if (jobSearch && jobSearch.trim() !== "") {
          params.search = jobSearch.trim();
        }
        if (city && city.trim() !== "") {
          params.city = city.trim();
        }
        if (district && district.trim() !== "") {
          params.district = district.trim();
        }

        // 필터링된 채용공고 조회 (모든 필터 조건을 동시에 만족하는 공고만 반환)
        const response = await api.get('/jobs/job-postings/', { params });
        const rawJobs = Array.isArray(response.data) ? response.data : response.data.results || [];
        
        // 채용공고에서 고유한 기업 ID 추출
        const corpIds = new Set<number>();
        rawJobs.forEach((job: any) => {
          if (job.corp && job.corp.id) {
            corpIds.add(job.corp.id);
          } else if (job.corp_id) {
            corpIds.add(job.corp_id);
          }
        });

        // 해당 기업 ID들에 해당하는 기업만 필터링
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [careerYear, jobSearch, city, district, allCompanies]);


  // 3. 선택된 기업의 공고 로드 (필터 적용)
  const fetchCompanyJobs = async (corpId: number) => {
    setIsJobsLoading(true);
    try {
      // 필터 파라미터 구성 (모든 필터가 AND 조건으로 적용됨)
      const params: any = {};
      if (careerYear && careerYear.trim() !== "") {
        const careerValue = parseInt(careerYear);
        if (!isNaN(careerValue)) {
          params.career_year = careerValue;
        }
      }
      if (jobSearch && jobSearch.trim() !== "") {
        params.search = jobSearch.trim();
      }
      if (city && city.trim() !== "") {
        params.city = city.trim();
      }
      if (district && district.trim() !== "") {
        params.district = district.trim();
      }

      const response = await api.get(`/jobs/corps/${corpId}/job-postings/`, { params });
      const rawJobs = Array.isArray(response.data) ? response.data : response.data.results || [];
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
  
  // 필터 초기화
  const resetFilters = () => {
    setCareerYear("");
    setJobSearch("");
    setCity("");
    setDistrict("");
  };
  
  // 필터가 적용되었는지 확인
  const hasActiveFilters = careerYear !== "" || jobSearch !== "" || city !== "" || district !== "";

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

  const filteredCompanies = useMemo(() => {
    return companies.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [companies, searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredCompanies.length > 0) {
      handleSelectCompany(filteredCompanies[0]);
    } else {
      alert("검색 결과가 없습니다.");
    }
  };

  if (loading) return <div className="w-full h-full bg-[#1A1B1E] flex items-center justify-center text-white">지도를 로드 중...</div>;

  return (
    // ✅ [수정] h-[85vh] -> h-full로 변경하여 부모(page.tsx)에서 계산된 높이를 가득 채움
    <div className="flex flex-col lg:flex-row w-full h-full bg-[#1A1B1E] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl">
      
      {/* SIDEBAR */}
      <div className="w-full lg:w-[400px] bg-[#25262B] border-r border-white/5 flex flex-col z-20">
        <div className="p-6 pb-4 border-b border-white/5 bg-[#2C2E33]/50">
          <h2 className="text-2xl font-black text-white mb-4">채용 지도</h2>
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <input 
              type="text" placeholder="기업명 검색..." 
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1A1B1E] text-white pl-10 pr-4 py-3 rounded-xl border border-white/10 outline-none text-sm"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          </form>
          
          {/* 필터 섹션 */}
          <div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between p-3 bg-[#1A1B1E] border border-white/10 rounded-xl hover:border-blue-500/40 transition-all"
            >
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-white">필터</span>
                {hasActiveFilters && (
                  <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                    활성
                  </span>
                )}
              </div>
              {hasActiveFilters && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetFilters();
                  }}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                >
                  <X size={14} />
                  초기화
                </button>
              )}
            </button>
            
            {showFilters && (
              <div className="mt-3 p-4 bg-[#1A1B1E] border border-white/10 rounded-xl space-y-3">
                {/* 경력 필터 */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">경력 (년)</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={careerYear}
                    onChange={(e) => setCareerYear(e.target.value)}
                    className="w-full bg-[#25262B] text-white px-3 py-2 rounded-lg border border-white/10 outline-none text-sm focus:border-blue-500"
                  />
                </div>
                
                {/* 직무분야 검색 */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">직무분야 검색</label>
                  <input
                    type="text"
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                    className="w-full bg-[#25262B] text-white px-3 py-2 rounded-lg border border-white/10 outline-none text-sm focus:border-blue-500"
                  />
                </div>
                
                {/* 시/도 필터 */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">시/도</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#25262B] text-white px-3 py-2 rounded-lg border border-white/10 outline-none text-sm focus:border-blue-500"
                  >
                    <option value="">전체</option>
                    {cities.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                
                {/* 구/군 필터 */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">구/군</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-[#25262B] text-white px-3 py-2 rounded-lg border border-white/10 outline-none text-sm focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
            {isDataLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                    <span>전체 기업 위치 분석 중...</span>
                </div>
            ) : selectedCompany ? (
                <div className="animate-in slide-in-from-left duration-300">
                    <button onClick={handleBackToList} className="flex items-center gap-2 text-gray-400 hover:text-white text-xs mb-3">
                        <ArrowLeft size={14} /> 전체 목록
                    </button>
                    <div className="bg-[#1A1B1E] p-3 rounded-xl border border-white/5 mb-4 flex items-start gap-3 relative">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1.5 shrink-0">
                            {selectedCompany.logo_url ? <img src={selectedCompany.logo_url} alt={selectedCompany.name} className="object-contain w-full h-full" /> : <Building2 className="text-gray-400 w-6 h-6" />}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-white truncate">{selectedCompany.name}</h2>
                                <button onClick={(e) => toggleCompanyFavorite(e, selectedCompany.id)}>
                                    <Star size={16} fill={favoriteCompanyIds.includes(selectedCompany.id) ? "#EAB308" : "none"} className={favoriteCompanyIds.includes(selectedCompany.id) ? "text-yellow-500" : "text-gray-500"} />
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1 flex items-start gap-1">
                                <MapPin size={10} className="shrink-0 mt-0.5" />
                                {selectedCompany.address}
                            </p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-gray-400">
                                채용공고 {companyJobs.length}개
                            </p>
                        </div>
                        {isJobsLoading ? (
                            <div className="text-center py-10 text-gray-500">공고 로딩 중...</div>
                        ) : companyJobs.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                {hasActiveFilters ? "필터 조건에 맞는 채용공고가 없습니다." : "채용공고가 없습니다."}
                            </div>
                        ) : (
                            companyJobs.map(job => (
                                <JobCard key={job.id} id={job.id} company={selectedCompany.name} logo={selectedCompany.logo_url} position={job.title} url={job.url} deadline={job.deadline} />
                            ))
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1 mb-4">
                        <p className="text-[10px] font-bold text-gray-500 uppercase">
                            {hasActiveFilters ? "필터링된 기업" : "전체 기업"} ({filteredCompanies.length})
                        </p>
                        {isDataLoading && (
                            <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                        )}
                    </div>
                    {filteredCompanies.length === 0 && !isDataLoading ? (
                        <div className="text-center py-10 text-gray-500">
                            {hasActiveFilters ? "필터 조건에 맞는 기업이 없습니다." : "기업이 없습니다."}
                        </div>
                    ) : (
                        filteredCompanies.map(company => (
                        <div key={company.id} className="group p-4 bg-[#1A1B1E] border border-white/5 hover:border-blue-500/40 rounded-2xl cursor-pointer flex items-center gap-4 transition-all">
                            <div onClick={() => handleSelectCompany(company)} className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1.5 shrink-0">
                                    {company.logo_url ? <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain" /> : <Building2 className="text-gray-400 w-6 h-6" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-white text-sm truncate">{company.name}</h3>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-1 truncate">{company.address}</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleCompanyFavorite(e, company.id);
                                }}
                                className="shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <Star 
                                    size={16} 
                                    fill={favoriteCompanyIds.includes(company.id) ? "#EAB308" : "none"} 
                                    className={favoriteCompanyIds.includes(company.id) ? "text-yellow-500" : "text-gray-500"} 
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
      <div className="flex-1 relative bg-gray-900">
        <KakaoMap 
            center={center} 
            style={{ width: "100%", height: "100%" }} 
            level={level} 
            onZoomChanged={(map) => setLevel(map.getLevel())}
            onIdle={(map) => setCenter({
                lat: map.getCenter().getLat(),
                lng: map.getCenter().getLng()
            })}
        >
          {filteredCompanies.map((company) => (
            <CustomOverlayMap 
                key={company.id} 
                position={{ lat: company.latitude, lng: company.longitude }} 
                yAnchor={0.5}
            >
                <div 
                    onClick={(e) => {
                        e.stopPropagation();
                        handleSelectCompany(company);
                    }} 
                    className="relative cursor-pointer group"
                >
                    <div className="flex flex-col items-center">
                        {/* 기업명 및 즐겨찾기 툴팁 */}
                        <div className={`px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/20 flex items-center gap-1 ${selectedCompany?.id === company.id ? "opacity-100 bg-blue-600" : ""}`}>
                            {favoriteCompanyIds.includes(company.id) && <Star size={10} fill="#EAB308" className="text-yellow-500" />}
                            {company.name}
                        </div>

                        {/* ✅ 줌 레벨에 따른 마커 디자인 변경 로직 */}
                        {level >= 6 ? (
                            /* 줌아웃 시: 파란색 점 */
                            <div className={`w-3 h-3 rounded-full border-2 border-white shadow-lg transition-all ${favoriteCompanyIds.includes(company.id) ? "bg-yellow-500 scale-125" : "bg-blue-600"}`} />
                        ) : (
                            /* 줌인 시: 로고 마커 */
                            <>
                                <div className={`w-10 h-10 rounded-full border-4 shadow-xl flex items-center justify-center bg-white transition-all duration-300 ${selectedCompany?.id === company.id ? "border-blue-500 scale-125 ring-4 ring-blue-500/20" : "border-white"}`}>
                                    {company.logo_url ? <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain rounded-full p-1.5" /> : <Building2 size={16} className="text-gray-400" />}
                                </div>
                                <div className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] -mt-0.5 transition-colors ${selectedCompany?.id === company.id ? "border-t-blue-500" : "border-t-white"}`} />
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