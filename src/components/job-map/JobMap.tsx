"use client";

import { useState, useMemo, useEffect } from "react";
import { Map as KakaoMap, CustomOverlayMap, useKakaoLoader, Polygon } from "react-kakao-maps-sdk";
import { Search, MapPin, Star, ArrowLeft, Wallet, Users, Globe, ChevronRight, Layers, ExternalLink } from "lucide-react";
import Image from "next/image";

// --- 데이터 타입 정의 ---
interface CompanyInfo {
  name: string;
  description: string;
  website: string;
  logo: string;
  category: string;
  address: string;
}

interface JobPosition {
  id: number;
  company: string;
  role: string;
  lat: number;
  lng: number;
  salary: string;
  tech: string[];
  description: string;
}

interface RegionBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

// --- 1. 기업 정보 데이터 ---
const MOCK_COMPANIES: Record<string, CompanyInfo> = {
  "Toss": {
    name: "Toss",
    description: "금융의 모든 순간을 혁신하는 토스입니다.",
    website: "https://toss.im",
    logo: "https://static.toss.im/assets/toss-logo/blue.png",
    category: "금융/핀테크",
    address: "서울 강남구 테헤란로 131"
  },
  "Kakao": {
    name: "Kakao",
    description: "사람과 세상, 그 이상을 연결하는 카카오입니다.",
    website: "https://www.kakaocorp.com",
    logo: "https://t1.kakaocdn.net/kakaocorp/kakaocorp/admin/1b904e28017800001.png",
    category: "모바일/플랫폼",
    address: "경기 성남시 분당구 판교역로 166"
  },
  "Line": {
    name: "Line",
    description: "전 세계 2억 명 이상의 유저가 사용하는 글로벌 메신저 LINE.",
    website: "https://linepluscorp.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg",
    category: "메신저/플랫폼",
    address: "경기 성남시 분당구 황새울로 360번길 42"
  },
  "Danggeun": {
    name: "Danggeun",
    description: "동네 이웃 간의 따뜻한 연결을 만드는 당근마켓입니다.",
    website: "https://about.daangn.com",
    logo: "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/8d/62/16/8d621644-8397-69c5-63aa-2f92b724497a/AppIcon-0-0-1x_U007emarketing-0-7-0-sRGB-85-220.png/512x512bb.jpg",
    category: "지역/커뮤니티",
    address: "서울 서초구 강남대로 465"
  }
};

// --- 2. 채용 공고 데이터 ---
const MOCK_JOBS: JobPosition[] = [
  // Toss (역삼)
  { id: 101, company: "Toss", role: "Frontend Developer", lat: 37.5000287, lng: 127.0329141, salary: "6,000 ~ 9,000", tech: ["React", "Next.js", "TypeScript"], description: "토스 앱의 웹뷰 및 인터널 제품의 프론트엔드 개발을 담당합니다." },
  { id: 102, company: "Toss", role: "Server Developer", lat: 37.5000287, lng: 127.0329141, salary: "6,500 ~ 9,500", tech: ["Kotlin", "Spring", "JPA"], description: "토스의 대규모 트래픽을 안정적으로 처리하는 서버 시스템을 구축합니다." },
  
  // Kakao (판교)
  { id: 201, company: "Kakao", role: "Android Developer", lat: 37.3957122, lng: 127.1105181, salary: "5,000 ~ 8,000", tech: ["Kotlin", "Android SDK"], description: "국민 앱 카카오톡의 안드로이드 클라이언트를 개발하고 고도화합니다." },
  { id: 202, company: "Kakao", role: "Data Engineer", lat: 37.3957122, lng: 127.1105181, salary: "5,500 ~ 8,500", tech: ["Hadoop", "Spark", "Python"], description: "카카오의 방대한 데이터를 수집, 처리, 분석하는 파이프라인을 구축합니다." },

  // Line (분당)
  { id: 301, company: "Line", role: "Global Platform Dev", lat: 37.3853198, lng: 127.1231789, salary: "6,500 ~", tech: ["Java", "Redis", "Kafka"], description: "글로벌 사용자들을 위한 대용량 메시징 플랫폼을 개발합니다." },

  // Danggeun (신논현)
  { id: 401, company: "Danggeun", role: "Software Engineer", lat: 37.5037754, lng: 127.0240711, salary: "업계 최고 수준", tech: ["Go", "React", "AWS"], description: "당근마켓 서비스의 전반적인 기능을 개발하며 사용자 가치를 창출합니다." },
];

// --- 3. 지역 강조(Spotlight) 설정 ---
const OUTER_LIMITS = [
  { lat: 38.5, lng: 126.0 }, { lat: 38.5, lng: 128.0 }, { lat: 36.5, lng: 128.0 }, { lat: 36.5, lng: 126.0 },
];

const LAT_MARGIN = 0.015; 
const LNG_MARGIN = 0.015 * 1.3;

// ✅ [FIX] 겹치는 영역 병합 로직 (수정됨)
const mergeOverlappingRegions = (regions: RegionBox[]): RegionBox[] => {
  if (regions.length === 0) return [];
  const merged = [...regions];
  let changed = true;

  while (changed) {
    changed = false;
    for (let i = 0; i < merged.length; i++) {
      for (let j = i + 1; j < merged.length; j++) {
        const r1 = merged[i];
        const r2 = merged[j];

        // 교차 검사 (Overlap Test)
        const isOverlapping = 
          r1.minLat < r2.maxLat && r1.maxLat > r2.minLat && 
          r1.minLng < r2.maxLng && r1.maxLng > r2.minLng;

        if (isOverlapping) {
          // 두 영역을 포함하는 더 큰 사각형으로 합체 (Union)
          merged[i] = {
            minLat: Math.min(r1.minLat, r2.minLat),
            maxLat: Math.max(r1.maxLat, r2.maxLat),
            minLng: Math.min(r1.minLng, r2.minLng),
            maxLng: Math.max(r1.maxLng, r2.maxLng),
          };
          // j번째 사각형 제거
          merged.splice(j, 1);
          changed = true;
          j--; // 인덱스 재조정
        }
      }
    }
  }
  return merged;
};

export default function JobMap() {
  const [loading, error] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_KEY as string,
    libraries: ["clusterer", "services"],
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [activeJob, setActiveJob] = useState<JobPosition | null>(null);
  
  const [center, setCenter] = useState({ lat: 37.501, lng: 127.028 });
  const [level, setLevel] = useState(8); 
  const [favorites, setFavorites] = useState<number[]>([101, 401]);
  const [showRegions, setShowRegions] = useState(false);

  // --- 연관 검색어 ---
  const suggestions = useMemo(() => {
    if (!searchQuery) return [];
    const lowerQuery = searchQuery.toLowerCase();
    const matchedCompanies = Array.from(new Set(MOCK_JOBS.filter(j => j.company.toLowerCase().includes(lowerQuery)).map(j => j.company))).map(c => ({ type: 'company', text: c }));
    const matchedRoles = Array.from(new Set(MOCK_JOBS.filter(j => j.role.toLowerCase().includes(lowerQuery)).map(j => j.role))).slice(0, 3).map(r => ({ type: 'role', text: r }));
    return [...matchedCompanies, ...matchedRoles];
  }, [searchQuery]);

  // --- 지도 마커용 데이터 (중복 제거) ---
  const mapMarkers = useMemo(() => {
    const uniqueCompanies = new Map();
    MOCK_JOBS.forEach(job => {
      if (!uniqueCompanies.has(job.company)) {
        uniqueCompanies.set(job.company, job);
      }
    });
    return Array.from(uniqueCompanies.values());
  }, []);

  // --- [로직] 지역 강조 경로 (병합 적용) ---
  const regionPaths = useMemo(() => {
    // 1. 각 기업 좌표를 기준으로 사각형 영역 생성
    const initialRegions: RegionBox[] = mapMarkers.map((job: any) => ({
      minLat: job.lat - LAT_MARGIN,
      maxLat: job.lat + LAT_MARGIN,
      minLng: job.lng - LNG_MARGIN,
      maxLng: job.lng + LNG_MARGIN,
    }));

    // 2. 겹치는 영역끼리 병합
    const mergedRegions = mergeOverlappingRegions(initialRegions);

    // 3. 폴리곤 경로 포맷으로 변환
    const holes = mergedRegions.map(r => [
      { lat: r.maxLat, lng: r.minLng }, // 좌상
      { lat: r.maxLat, lng: r.maxLng }, // 우상
      { lat: r.minLat, lng: r.maxLng }, // 우하
      { lat: r.minLat, lng: r.minLng }, // 좌하
    ]);

    return [OUTER_LIMITS, ...holes];
  }, [mapMarkers]);

  // --- [로직] 타겟 기업 찾기 ---
  const targetCompany = useMemo(() => {
    if (selectedCompany) return selectedCompany;
    if (!submittedQuery) return null;
    const matchedKey = Object.keys(MOCK_COMPANIES).find(key => 
      key.toLowerCase().includes(submittedQuery.toLowerCase())
    );
    return matchedKey || null;
  }, [submittedQuery, selectedCompany]);

  const companyJobs = useMemo(() => {
    if (!targetCompany) return [];
    return MOCK_JOBS.filter(job => job.company === targetCompany);
  }, [targetCompany]);

  const filteredJobs = useMemo(() => {
    if (targetCompany) return [];
    if (!submittedQuery) return MOCK_JOBS.filter(job => favorites.includes(job.id));
    return MOCK_JOBS.filter(job => 
      job.role.toLowerCase().includes(submittedQuery.toLowerCase())
    );
  }, [submittedQuery, favorites, targetCompany]);

  // ✅ [FIX] 검색 시 위치 이동 로직 (정확한 좌표 사용)
  useEffect(() => {
    if (targetCompany) {
      // 해당 기업의 '첫 번째' 공고 좌표를 찾아 정확히 이동
      const targetJob = MOCK_JOBS.find(job => job.company === targetCompany);
      
      if (targetJob && targetJob.lat && targetJob.lng) {
        // 비동기 렌더링 이슈 방지를 위해 약간의 지연 후 이동
        setTimeout(() => {
            setCenter({ lat: targetJob.lat, lng: targetJob.lng });
            setLevel(4); // 적절한 확대 레벨
        }, 50);
      }
    }
  }, [targetCompany]);

  // --- 핸들러 ---
  const executeSearch = (query: string) => {
    setSubmittedQuery(query);
    setSearchQuery(query);
    setSelectedCompany(null);
    setActiveJob(null);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') executeSearch(searchQuery);
  };

  const handleMarkerClick = (companyName: string, lat: number, lng: number) => {
    setSelectedCompany(companyName);
    setActiveJob(null);
    setSubmittedQuery(""); 
    setSearchQuery(companyName);
    setCenter({ lat, lng });
    setLevel(4);
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  if (loading) return <div className="w-full h-[85vh] bg-[#1A1B1E] flex items-center justify-center text-gray-500">지도 로드 중...</div>;
  if (error) return <div className="w-full h-[85vh] flex items-center justify-center text-red-500">지도 로드 실패</div>;

  return (
    <div className="flex flex-col lg:flex-row w-full h-[85vh] bg-[#1A1B1E] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl font-sans">
      
      {/* ================= LEFT SIDEBAR ================= */}
      <div className="w-full lg:w-[400px] bg-[#25262B] border-r border-white/5 flex flex-col z-20 shadow-xl">
        <div className="p-6 pb-4 border-b border-white/5 relative">
          <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
            채용 지도
          </h2>
          
          <div className="relative z-50">
            <input 
              type="text" 
              placeholder="기업명(예: Toss) 또는 직무 검색..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              className="w-full bg-[#1A1B1E] text-white pl-10 pr-10 py-3 rounded-xl border border-white/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-600 text-sm"
            />
            <Search 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 cursor-pointer hover:text-white" 
                onClick={() => executeSearch(searchQuery)}
            />
            {showSuggestions && searchQuery && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1B1E] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                    {suggestions.map((item, idx) => (
                        <div key={idx} onClick={() => executeSearch(item.text)} className="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-center gap-3 text-sm text-gray-300">
                            {item.type === 'company' ? <Layers size={14} className="text-blue-400"/> : <Search size={14} className="text-gray-500"/>}
                            <span>{item.text}</span>
                        </div>
                    ))}
                </div>
            )}
          </div>
          {showSuggestions && <div className="fixed inset-0 z-40" onClick={() => setShowSuggestions(false)} />}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {/* [VIEW 1] 상세 공고 */}
          {activeJob ? (
            <div className="p-6 animate-in slide-in-from-left duration-300">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setActiveJob(null)} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                    {activeJob.company} 채용 목록으로
                </button>
                <button onClick={() => toggleFavorite(activeJob.id)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    <Star size={20} className={favorites.includes(activeJob.id) ? "fill-yellow-400 text-yellow-400" : "text-gray-500"} />
                </button>
              </div>
              <div className="bg-[#1A1B1E] p-5 rounded-2xl border border-white/5 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <Image src={MOCK_COMPANIES[activeJob.company].logo} alt={activeJob.company} width={48} height={48} className="rounded-xl bg-white p-1" unoptimized />
                  <div><h3 className="text-lg font-bold text-white">{activeJob.role}</h3><p className="text-blue-400 text-sm">{activeJob.company}</p></div>
                </div>
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-center gap-3"><Wallet className="w-4 h-4 text-gray-500" /><span>{activeJob.salary}</span></div>
                  <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-gray-500" /><span>{MOCK_COMPANIES[activeJob.company].address}</span></div>
                </div>
              </div>
              <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                지원하기 <ExternalLink size={16} />
              </button>
            </div>
          ) : targetCompany ? (
            /* [VIEW 2] 기업 뷰 (검색결과) */
            <div className="animate-in slide-in-from-left duration-300">
              <div className="p-6 bg-gradient-to-b from-[#2C2D33] to-[#25262B] border-b border-white/5">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-2 shadow-lg">
                            <Image src={MOCK_COMPANIES[targetCompany].logo} alt={targetCompany} width={48} height={48} className="object-contain" unoptimized />
                        </div>
                        <div><h1 className="text-2xl font-bold text-white">{targetCompany}</h1><p className="text-gray-400 text-xs">{MOCK_COMPANIES[targetCompany].category}</p></div>
                    </div>
                    <a href={MOCK_COMPANIES[targetCompany].website} target="_blank" rel="noreferrer" className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-blue-400"><Globe size={18} /></a>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed mb-4">{MOCK_COMPANIES[targetCompany].description}</p>
                <div className="flex gap-2 text-xs text-gray-500"><MapPin size={12}/> {MOCK_COMPANIES[targetCompany].address}</div>
              </div>
              <div className="p-4 space-y-3">
                <h3 className="text-sm font-bold text-white px-2 mb-2">진행 중인 채용 <span className="text-xs bg-blue-600 px-2 py-0.5 rounded-full ml-1">{companyJobs.length}</span></h3>
                {companyJobs.map((job) => (
                  <div key={job.id} onClick={() => setActiveJob(job)} className="group p-4 bg-[#1A1B1E] border border-white/5 hover:border-blue-500/50 rounded-xl cursor-pointer flex items-center justify-between">
                    <div>
                        <h4 className="text-white font-bold text-sm group-hover:text-blue-200">{job.role}</h4>
                        <div className="flex gap-2 mt-2">{job.tech.slice(0, 2).map(t => (<span key={t} className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-gray-400">{t}</span>))}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); toggleFavorite(job.id); }} className="p-1.5 hover:bg-white/10 rounded-full"><Star size={16} className={favorites.includes(job.id) ? "fill-yellow-400 text-yellow-400" : "text-gray-600"} /></button>
                        <ChevronRight size={16} className="text-gray-600 group-hover:text-blue-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* [VIEW 3] 즐겨찾기/일반 리스트 */
            <div className="p-4 space-y-2">
              <div className="px-2 mb-2 flex justify-between items-end"><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{submittedQuery ? `검색 결과 (${filteredJobs.length})` : "내 즐겨찾기"}</span></div>
              {filteredJobs.length === 0 && <div className="flex flex-col items-center justify-center py-20 text-gray-500 text-sm gap-2 opacity-50"><Star size={32} /><p>{submittedQuery ? "검색 결과가 없습니다." : "즐겨찾기한 공고가 없습니다."}</p></div>}
              {filteredJobs.map((job) => (
                <div key={job.id} onClick={() => handleMarkerClick(job.company, job.lat, job.lng)} className="group p-4 bg-[#1A1B1E] border border-white/5 hover:border-blue-500/50 rounded-2xl cursor-pointer flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1.5 shrink-0"><Image src={MOCK_COMPANIES[job.company].logo} alt={job.company} width={40} height={40} className="object-contain" unoptimized /></div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm truncate">{job.role}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{job.company}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); toggleFavorite(job.id); }} className="p-2 hover:bg-white/10 rounded-full z-10">
                        <Star size={18} className={favorites.includes(job.id) ? "fill-yellow-400 text-yellow-400" : "text-gray-600"} />
                    </button>
                    <ChevronRight size={16} className="text-gray-600 group-hover:text-blue-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================= RIGHT MAP ================= */}
      <div className="flex-1 relative bg-gray-900">
        <KakaoMap center={center} style={{ width: "100%", height: "100%" }} level={level} isPanto={true} onZoomChanged={(map) => setLevel(map.getLevel())}>
          {showRegions && <Polygon path={regionPaths} strokeWeight={3} strokeColor={"#3B82F6"} strokeOpacity={1} strokeStyle={"solid"} fillColor={"#000000"} fillOpacity={0.7} />}
          {mapMarkers.map((job) => (
            <CustomOverlayMap key={job.company} position={{ lat: job.lat, lng: job.lng }} yAnchor={1} zIndex={1}>
                <div onClick={() => handleMarkerClick(job.company, job.lat, job.lng)} className="relative cursor-pointer transform transition-transform duration-300 hover:scale-110 hover:-translate-y-2">
                    {level > 5 ? (
                        <div className={`w-4 h-4 rounded-full border-2 border-white shadow-md ${targetCompany === job.company ? "bg-blue-500 scale-125" : "bg-blue-600"}`} />
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className={`w-12 h-12 rounded-full border-4 shadow-xl flex items-center justify-center z-10 ${targetCompany === job.company ? "bg-blue-600 border-white" : "bg-white border-blue-600"}`}>
                                <Image src={MOCK_COMPANIES[job.company].logo} alt={job.company} width={28} height={28} className="object-contain rounded-full" unoptimized />
                            </div>
                            <div className={`w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] -mt-1 ${targetCompany === job.company ? "border-t-blue-600" : "border-t-white"}`} 
                                style={{ borderTopColor: targetCompany === job.company ? "#2563EB" : "#FFFFFF", filter: targetCompany === job.company ? "" : "drop-shadow(0 2px 2px rgba(0,0,0,0.2))" }} 
                            />
                        </div>
                    )}
                </div>
            </CustomOverlayMap>
          ))}
        </KakaoMap>
        <div className="absolute top-4 right-4 z-10">
          <button onClick={() => setShowRegions(!showRegions)} className={`px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 transition-all border ${showRegions ? "bg-blue-600 text-white border-blue-400" : "bg-[#25262B] text-gray-400 border-white/10 hover:bg-[#2C2D33]"}`}>
            <Layers size={14} />{showRegions ? "주요 지역 강조 ON" : "주요 지역 강조 OFF"}
          </button>
        </div>
      </div>
    </div>
  );
}