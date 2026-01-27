'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle2, TrendingUp, AlertCircle, HelpCircle, Hash, Info, Search, X, ChevronDown } from 'lucide-react';
import { fetchAllTechStacks } from '@/services/trendService';
import { api } from '@/lib/api';

interface DashboardViewProps {
    resumeTitle: string;
    resumeText?: string | null;
    resumeId?: number;
    resumeKeywords: string[];
    selectedCompany: any;
    setSelectedCompany: (c: any) => void;
    toggleFavorite: (e: any, id: number) => void;
    matchScore: number;
    onOpenReport: () => void;
    onDataUpdate: (data: {
        feedbacks: AnalysisFeedback[];
        questions: string[];
        jobPostingTitle?: string;
    }) => void;
}

interface AnalysisFeedback {
    id: string;
    type: 'strength' | 'improvement' | 'matching';
    targetText?: string;
    comment: string;
}

interface CompanyWithJobPosting {
    id: number;
    name: string;
    logo_url?: string;
    address?: string;
    jobPostings: Array<{
        id: number;
        title: string;
        description?: string;
        url?: string;
        isAnalyzed?: boolean;
    }>;
    isAllAnalyzed?: boolean;
}

export default function DashboardView({
    resumeTitle, resumeText, resumeId, resumeKeywords, selectedCompany, setSelectedCompany, toggleFavorite, matchScore, onOpenReport, onDataUpdate
}: DashboardViewProps) {
    const [clickedFeedbackId, setClickedFeedbackId] = useState<string | null>(null);
    const resumeViewerRef = useRef<HTMLDivElement>(null);

    const [analysisData, setAnalysisData] = useState<{
        positive_feedback?: string;
        negative_feedback?: string;
        enhancements_feedback?: string;
        question?: string;
    } | null>(null);
    
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
    const [companiesWithJobs, setCompaniesWithJobs] = useState<CompanyWithJobPosting[]>([]);
    const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
    const [selectedJobPostingId, setSelectedJobPostingId] = useState<number | null>(null);
    
    const [companyListTab, setCompanyListTab] = useState<'favorites' | 'search'>('favorites');
    const [companySearchQuery, setCompanySearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<CompanyWithJobPosting[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [expandedCompanyIds, setExpandedCompanyIds] = useState<Set<number>>(new Set());
    
    const [techLogos, setTechLogos] = useState<Record<string, string>>({});
    
    // 분석 완료된 채용공고 관련 상태
    const [analyzedJobPostingIds, setAnalyzedJobPostingIds] = useState<Set<number>>(new Set());
    const [recentAnalyzedJobs, setRecentAnalyzedJobs] = useState<Array<{
        jobPostingId: number;
        jobTitle: string;
        companyId: number;
        companyName: string;
        companyLogo?: string;
    }>>([]);
    const [favoriteCorpIds, setFavoriteCorpIds] = useState<Set<number>>(new Set());

    // ✅ [추가] 선택 해제 시에도 마지막 색상으로 사라지게 하기 위한 상태
    const [lastActiveFeedback, setLastActiveFeedback] = useState<AnalysisFeedback | null>(null);

    // 1. 기술 스택 로고 로딩
    useEffect(() => {
        const loadTechLogos = async () => {
            try {
                const stacks = await fetchAllTechStacks();
                const logoMap: Record<string, string> = {};
                stacks.forEach(stack => {
                    if (stack.logo) logoMap[stack.name.toLowerCase()] = stack.logo;
                });
                setTechLogos(logoMap);
            } catch (error) { console.error(error); }
        };
        loadTechLogos();
    }, []);

    // 1.5 분석 완료된 채용공고 목록 로딩
    useEffect(() => {
        const loadAnalyzedJobPostings = async () => {
            if (!resumeId) return;
            try {
                const matchingsResponse = await api.get('/resumes/matchings/');
                const matchings = matchingsResponse.data.results || matchingsResponse.data || [];
                
                // 현재 이력서와 매칭된 채용공고만 필터링
                const currentResumeMatchings = matchings.filter((m: any) => m.resume === resumeId);
                const analyzedIds = new Set<number>(currentResumeMatchings.map((m: any) => m.job_posting));
                setAnalyzedJobPostingIds(analyzedIds);
                
                // 분석된 채용공고의 상세 정보 가져오기
                const analyzedJobsDetails: Array<{
                    jobPostingId: number;
                    jobTitle: string;
                    companyId: number;
                    companyName: string;
                    companyLogo?: string;
                }> = [];
                
                for (const matching of currentResumeMatchings) {
                    try {
                        const jobRes = await api.get(`/jobs/job-postings/${matching.job_posting}/`);
                        const jobData = jobRes.data;
                        if (jobData) {
                            analyzedJobsDetails.push({
                                jobPostingId: jobData.id,
                                jobTitle: jobData.title,
                                companyId: jobData.corp?.id || jobData.corp_id,
                                companyName: jobData.corp?.name || '알 수 없음',
                                companyLogo: jobData.corp?.logo_url
                            });
                        }
                    } catch (e) { /* 개별 오류 무시 */ }
                }
                
                setRecentAnalyzedJobs(analyzedJobsDetails);
            } catch (error) { console.error('분석 완료된 채용공고 로딩 실패:', error); }
        };
        loadAnalyzedJobPostings();
    }, [resumeId]);

    // 2. 기업 목록 로딩
    useEffect(() => {
        const loadFavoriteCompaniesWithJobs = async () => {
            setIsLoadingCompanies(true);
            try {
                const { getAuthTokens } = await import('@/lib/auth');
                const { accessToken } = getAuthTokens();
                if(!accessToken) { setIsLoadingCompanies(false); return; }
                
                const bookmarksResponse = await api.get('/jobs/corp-bookmarks/');
                const bookmarks = bookmarksResponse.data.results || bookmarksResponse.data || [];
                const favCorpIds = bookmarks.map((b:any) => b.corp?.id ?? b.corp_id).filter(Boolean);
                setFavoriteCorpIds(new Set(favCorpIds)); // 즐겨찾기 기업 ID 저장
                
                if (favCorpIds.length === 0) {
                    setCompaniesWithJobs([]);
                    setIsLoadingCompanies(false);
                    return;
                }

                const companiesData = await Promise.all(favCorpIds.map(async (id: number) => {
                    try {
                        let corpData = bookmarks.find((b:any) => (b.corp?.id === id || b.corp_id === id))?.corp;
                        if (!corpData || !corpData.name) {
                             const corpRes = await api.get(`/jobs/corps/${id}/`);
                             corpData = corpRes.data;
                        }
                        const jobRes = await api.get(`/jobs/corps/${id}/job-postings/?page_size=20`);
                        const jobList = Array.isArray(jobRes.data) ? jobRes.data : (jobRes.data.results || []);

                        return {
                            id: corpData.id,
                            name: corpData.name,
                            logo_url: corpData.logo_url,
                            address: corpData.address,
                            jobPostings: jobList.map((j:any) => ({
                                id: j.id,
                                title: j.title,
                                description: j.description,
                                url: j.url,
                                isAnalyzed: analyzedJobPostingIds.has(j.id)
                            })),
                            isAllAnalyzed: false
                        };
                    } catch { return null; }
                }));
                setCompaniesWithJobs(companiesData.filter(Boolean) as CompanyWithJobPosting[]);

            } catch (error) { setCompaniesWithJobs([]); } 
            finally { setIsLoadingCompanies(false); }
        };
        if (companyListTab === 'favorites') loadFavoriteCompaniesWithJobs();
    }, [companyListTab, resumeId, analyzedJobPostingIds]);

    // 3. 검색 로직
    useEffect(() => {
        const searchCompanies = async () => {
            if (!companySearchQuery.trim()) { setSearchResults([]); return; }
            setIsSearching(true);
            try {
                const res = await api.get(`/jobs/corps/?corp_name=${encodeURIComponent(companySearchQuery)}`);
                const results = await Promise.all((res.data || []).map(async (corp:any) => {
                    let jobPostings = [];
                    try {
                        const jobs = await api.get(`/jobs/corps/${corp.id}/job-postings/`);
                        jobPostings = jobs.data.results || jobs.data || [];
                    } catch (e) {}
                    
                    return { 
                        id: corp.id,
                        name: corp.name,
                        logo_url: corp.logo_url,
                        address: corp.address,
                        jobPostings: jobPostings.map((j:any) => ({
                            ...j, 
                            isAnalyzed: analyzedJobPostingIds.has(j.id)
                        })), 
                        isAllAnalyzed: false 
                    };
                }));
                setSearchResults(results);
            } catch { setSearchResults([]); }
            finally { setIsSearching(false); }
        };
        const timer = setTimeout(() => { if (companyListTab === 'search') searchCompanies(); }, 300);
        return () => clearTimeout(timer);
    }, [companySearchQuery, companyListTab, analyzedJobPostingIds]);

    // 3.5 즐겨찾기가 아닌 분석 완료된 채용공고 필터링
    const nonFavoriteAnalyzedJobs = useMemo(() => {
        return recentAnalyzedJobs.filter(job => !favoriteCorpIds.has(job.companyId));
    }, [recentAnalyzedJobs, favoriteCorpIds]);

    // 5. 분석 데이터 가져오기
    useEffect(() => {
        const fetchAnalysis = async () => {
            if (!resumeId || !selectedJobPostingId) {
                setAnalysisData(null);
                setClickedFeedbackId(null);
                onDataUpdate({ feedbacks: [], questions: [], jobPostingTitle: undefined });
                setIsLoadingAnalysis(false);
                return;
            }
            setAnalysisData(null);
            setIsLoadingAnalysis(true);
            setClickedFeedbackId(null);

            try {
                let resultData = null;
                try {
                    const matchingsResponse = await api.get('/resumes/matchings/');
                    const matchings = matchingsResponse.data.results || matchingsResponse.data || [];
                    const existing = matchings.find((m: any) => m.resume === resumeId && m.job_posting === selectedJobPostingId);
                    if(existing) resultData = existing;
                } catch(e) {}

                if (!resultData) {
                    const res = await api.post(`/resumes/${resumeId}/match/${selectedJobPostingId}/`);
                    resultData = res.data;
                }
                
                setAnalysisData(resultData);
                
                // 분석 완료 시 analyzedJobPostingIds에 추가
                setAnalyzedJobPostingIds(prev => new Set([...prev, selectedJobPostingId]));
                
                const parsedFeedbacks = parseFeedbacks(resultData);
                const parsedQuestions = parseQuestions(resultData.question);

                let jobTitle = "채용공고";
                const allCompanies = companyListTab === 'favorites' ? companiesWithJobs : searchResults;
                for (const company of allCompanies) {
                    const job = company.jobPostings.find(j => j.id === selectedJobPostingId);
                    if (job) {
                        jobTitle = job.title;
                        break;
                    }
                }

                onDataUpdate({ 
                    feedbacks: parsedFeedbacks, 
                    questions: parsedQuestions, 
                    jobPostingTitle: jobTitle 
                });

            } catch (error) { 
                onDataUpdate({ feedbacks: [], questions: [], jobPostingTitle: undefined });
            } finally { 
                setIsLoadingAnalysis(false); 
            }
        };
        fetchAnalysis();
    }, [resumeId, selectedJobPostingId]);

    const extractTargetText = (text: string) => {
        if (!text) return "";
        const bracketMatch = text.match(/^\s*\[\s*(?:'|")([^'"]+)(?:'|")\s*\]\s*$/);
        if (bracketMatch) return bracketMatch[1];
        const quoteMatch = text.match(/(?:'|")([^'"]{3,})(?:'|")/);
        if (quoteMatch) return quoteMatch[1];
        const colonMatch = text.split(/:\s*/);
        if (colonMatch.length > 1) return colonMatch[1];
        return text; 
    };

    const parseFeedbacks = (data: any): AnalysisFeedback[] => {
        if (!data) return [];
        const feedbacks: AnalysisFeedback[] = [];
        if (data.positive_feedback) feedbacks.push({ id: 'positive', type: 'strength', comment: data.positive_feedback, targetText: extractTargetText(data.positive_feedback) });
        if (data.negative_feedback) feedbacks.push({ id: 'negative', type: 'improvement', comment: data.negative_feedback, targetText: extractTargetText(data.negative_feedback) });
        if (data.enhancements_feedback) feedbacks.push({ id: 'enhancements', type: 'improvement', comment: data.enhancements_feedback, targetText: extractTargetText(data.enhancements_feedback) });
        return feedbacks;
    };

    const parseQuestions = (qStr?: string): string[] => {
        if (!qStr) return [];
        return qStr.split('\n').map(q => q.trim()).filter(q => q.length > 0 && q.startsWith('-')).map(q => q.substring(1).trim());
    };

    const currentFeedbacks = useMemo(() => parseFeedbacks(analysisData), [analysisData]);

    const getHighlightRGB = (type: string) => {
        switch (type) {
            case 'strength': return '59, 130, 246'; // Blue
            case 'matching': return '34, 197, 94'; // Green
            case 'improvement': return '249, 115, 22'; // Orange
            default: return '255, 255, 255';
        }
    };

    const extractKeywords = (text: string) => {
        if (!text) return [];
        const words = text.match(/([a-zA-Z0-9+#]+|[가-힣]+)/g) || [];
        return words.filter(w => w.length >= 2);
    };

    // ✅ [핵심] 마지막 선택된 피드백 기억 (사라지는 애니메이션 용)
    useEffect(() => {
        const current = currentFeedbacks.find(fb => fb.id === clickedFeedbackId);
        if (current) {
            setLastActiveFeedback(current);
        }
    }, [clickedFeedbackId, currentFeedbacks]);

    // ✅ [핵심] 렌더링 로직 개선 (Transition 활용)
    // 텍스트를 항상 문장 단위로 쪼개고, isActive 상태에 따라 스타일만 부드럽게 변경
    const renderHighlightedText = (text: string) => {
        // 문장 분리 (메모이제이션 권장되나 텍스트가 짧아 직접 수행)
        const sentences = text.split(/([.\n!?]+)/);

        // 현재 활성화된 피드백이 없으면(선택 해제 시), 직전에 활성화되었던 피드백 정보를 사용해
        // "어떤 단어를 칠했었는지"를 기억하고 있다가 색을 뺍니다.
        const activeFeedback = currentFeedbacks.find(fb => fb.id === clickedFeedbackId);
        const displayFeedback = activeFeedback || lastActiveFeedback;

        if (!displayFeedback) {
            return <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm lg:text-base font-light">{text}</div>;
        }

        const sourceForKeywords = (displayFeedback.targetText && displayFeedback.targetText.length > 5) 
            ? displayFeedback.targetText 
            : displayFeedback.comment;
            
        const searchKeywords = extractKeywords(sourceForKeywords);
        const highlightRGB = getHighlightRGB(displayFeedback.type);

        return (
            <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm lg:text-base font-light">
                {sentences.map((part, i) => {
                    if (!part || part.match(/^[.\n!?\s]+$/)) {
                        return <span key={i}>{part}</span>;
                    }

                    const partKeywords = extractKeywords(part);
                    const hasMatch = partKeywords.some(word => 
                        searchKeywords.some(keyword => 
                            word.toLowerCase().includes(keyword.toLowerCase()) || 
                            keyword.toLowerCase().includes(word.toLowerCase())
                        )
                    );

                    // ✅ 현재 선택된 상태인지 확인 (선택 해제되면 false가 되어 스타일이 빠짐)
                    const isActive = !!activeFeedback && hasMatch;

                    // 키워드가 포함된 문장은 항상 span으로 렌더링하되, 스타일을 동적으로 변경
                    if (hasMatch || isActive) {
                        return (
                            <span 
                                key={i}
                                id={isActive ? "highlighted-part" : undefined}
                                style={{
                                    // 1. 배경 그라데이션 (항상 존재하지만 Size로 조절)
                                    backgroundImage: `linear-gradient(to right, rgba(${highlightRGB}, 0.5) 0%, rgba(${highlightRGB}, 0.2) 100%)`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'left 85%', 
                                    
                                    // 2. 애니메이션 핵심: isActive면 100%, 아니면 0% (사라짐)
                                    backgroundSize: isActive ? '100% 90%' : '0% 90%',
                                    
                                    // 3. 텍스트 스타일 변화
                                    color: isActive ? '#ffffff' : 'rgba(209, 213, 219, 1)', // white <-> gray-300
                                    fontWeight: isActive ? '600' : '300',
                                    textShadow: isActive ? `0 0 10px rgba(${highlightRGB}, 0.8)` : 'none',
                                    
                                    // 4. 공통 스타일
                                    borderRadius: '2px',
                                    padding: '2px 0',
                                    boxDecorationBreak: 'clone',
                                    WebkitBoxDecorationBreak: 'clone',
                                    
                                    // 5. 부드러운 전환 (Transition)
                                    transition: 'background-size 0.6s cubic-bezier(0.25, 1, 0.5, 1), color 0.4s ease, text-shadow 0.4s ease'
                                }}
                            >
                                {part}
                            </span>
                        );
                    }

                    // 관련 없는 문장은 일반 텍스트 + 투명도 조절
                    return (
                        <span 
                            key={i} 
                            style={{ 
                                opacity: activeFeedback ? 0.5 : 1, // 활성화된게 있으면 나머지는 흐리게, 없으면 선명하게
                                transition: 'opacity 0.5s ease' 
                            }}
                        >
                            {part}
                        </span>
                    );
                })}
            </div>
        );
    };

    // 하이라이트된 부분으로 자동 스크롤
    useEffect(() => {
        if (clickedFeedbackId) {
            setTimeout(() => {
                const el = document.getElementById('highlighted-part');
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        }
    }, [clickedFeedbackId]);

    const handleFeedbackClick = (id: string) => {
        setClickedFeedbackId(prev => prev === id ? null : id);
    };

    const toggleCompanyExpand = (e: React.MouseEvent, companyId: number) => {
        e.stopPropagation();
        setExpandedCompanyIds(prev => {
            const next = new Set(prev);
            if(next.has(companyId)) next.delete(companyId); else next.add(companyId);
            return next;
        });
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full h-[calc(100vh-140px)] min-h-[600px]">
            {/* 좌측 패널 */}
            <div className="lg:col-span-3 flex flex-col gap-4 h-full min-h-0">
                <section className="flex-1 bg-[#212226] border border-white/5 rounded-[24px] p-5 flex flex-col overflow-hidden min-h-0">
                    <div className="flex bg-black/20 p-1 rounded-lg mb-4 shrink-0">
                        <button onClick={() => setCompanyListTab('favorites')} className={`flex-1 py-1.5 text-xs font-bold rounded-md ${companyListTab === 'favorites' ? 'bg-white/10 text-white' : 'text-gray-500'}`}>즐겨찾기</button>
                        <button onClick={() => setCompanyListTab('search')} className={`flex-1 py-1.5 text-xs font-bold rounded-md ${companyListTab === 'search' ? 'bg-white/10 text-white' : 'text-gray-500'}`}>검색</button>
                    </div>
                    {companyListTab === 'search' && (
                        <>
                            <div className="relative mb-3 shrink-0">
                                <input type="text" value={companySearchQuery} onChange={(e) => setCompanySearchQuery(e.target.value)} placeholder="기업명 검색" className="w-full pl-9 pr-8 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                {companySearchQuery && <button onClick={() => setCompanySearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={14}/></button>}
                            </div>
                            
                            {/* 즐겨찾기가 아닌 분석한 공고 */}
                            {nonFavoriteAnalyzedJobs.length > 0 && !companySearchQuery && (
                                <div className="mb-3 space-y-1 shrink-0">
                                    {nonFavoriteAnalyzedJobs.map(job => (
                                        <div 
                                            key={job.jobPostingId} 
                                            onClick={() => { 
                                                setSelectedJobPostingId(job.jobPostingId); 
                                                setSelectedCompany({ id: job.companyId, name: job.companyName, logo_url: job.companyLogo, jobPostingId: job.jobPostingId }); 
                                            }}
                                            className={`p-2 rounded-lg border cursor-pointer flex items-center gap-2 ${selectedJobPostingId === job.jobPostingId ? 'border-green-500/50 bg-green-500/10' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                                        >
                                            <div className="w-5 h-5 rounded bg-white p-0.5 flex items-center justify-center shrink-0">
                                                {job.companyLogo ? <img src={job.companyLogo} alt="" className="w-full h-full object-contain"/> : <span className="text-black font-bold text-[8px]">{job.companyName[0]}</span>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[10px] text-gray-500 truncate">{job.companyName}</div>
                                                <div className="text-xs text-gray-300 truncate">{job.jobTitle}</div>
                                            </div>
                                            <CheckCircle2 size={12} className="text-green-400 shrink-0" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                        {(companyListTab === 'favorites' ? companiesWithJobs : searchResults).map(company => {
                            const analyzedCount = company.jobPostings.filter(j => j.isAnalyzed || analyzedJobPostingIds.has(j.id)).length;
                            const isAllAnalyzed = company.jobPostings.length > 0 && analyzedCount === company.jobPostings.length;
                            
                            return (
                            <div key={company.id} className="space-y-1">
                                <div onClick={(e) => toggleCompanyExpand(e, company.id)} className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer hover:bg-white/5 ${selectedCompany?.id === company.id ? 'border-white/20 bg-white/5' : 'border-transparent'}`}>
                                    <div className="w-8 h-8 rounded bg-white p-1 flex items-center justify-center shrink-0">
                                        {company.logo_url ? <img src={company.logo_url} alt="" className="w-full h-full object-contain"/> : <span className="text-black font-bold text-xs">{company.name[0]}</span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-gray-200 truncate">{company.name}</div>
                                        <div className="text-[10px] text-gray-500">{company.jobPostings.length}개 공고</div>
                                    </div>
                                    {isAllAnalyzed && <CheckCircle2 size={14} className="text-green-400 shrink-0" />}
                                    <ChevronDown size={14} className={`text-gray-500 transition-transform ${expandedCompanyIds.has(company.id) ? 'rotate-180' : ''}`} />
                                </div>
                                <AnimatePresence>
                                    {expandedCompanyIds.has(company.id) && (
                                        <motion.div initial={{height:0}} animate={{height:'auto'}} exit={{height:0}} className="overflow-hidden ml-2 pl-2 border-l border-white/10 space-y-1">
                                            {company.jobPostings.map(job => {
                                                const isAnalyzed = job.isAnalyzed || analyzedJobPostingIds.has(job.id);
                                                return (
                                                    <div 
                                                        key={job.id} 
                                                        onClick={(e) => { e.stopPropagation(); setSelectedJobPostingId(job.id); setSelectedCompany({...company, jobPostingId: job.id}); }} 
                                                        className={`p-2 rounded text-xs cursor-pointer flex items-center gap-1 ${selectedJobPostingId === job.id ? 'text-blue-300 bg-blue-500/10' : 'text-gray-400 hover:text-white'}`}
                                                    >
                                                        <span className="truncate flex-1">{job.title}</span>
                                                        {isAnalyzed && <CheckCircle2 size={12} className="text-green-400 shrink-0" />}
                                                    </div>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                        })}
                    </div>
                </section>
                
                <section className="h-[250px] shrink-0 bg-[#212226] border border-white/5 rounded-[24px] p-5 flex flex-col">
                    <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase flex items-center gap-2"><Hash size={14}/> My Tech</h3>
                    <div className="flex flex-wrap gap-2 overflow-y-auto custom-scrollbar content-start">
                        {resumeKeywords.map((k, i) => (
                            <span key={i} className="px-2 py-1 bg-white/5 rounded border border-white/10 text-xs text-gray-300 flex items-center gap-1">
                                {techLogos[k.toLowerCase()] && <img src={techLogos[k.toLowerCase()]} alt="" className="w-3 h-3 object-contain"/>} {k}
                            </span>
                        ))}
                    </div>
                </section>
            </div>

            {/* 중앙 패널 */}
            <div className="lg:col-span-6 flex flex-col gap-4 h-full min-h-0">
                <section className="h-[60%] bg-[#212226] border border-white/5 rounded-[24px] p-6 flex flex-col relative group">
                    <div className="flex justify-between items-center mb-4 shrink-0">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><FileText size={18} className="text-blue-400"/> {resumeTitle}</h3>
                        <div className="flex gap-2 text-[10px] font-bold">
                            <span className="text-blue-400 px-2 py-1 bg-blue-900/30 rounded text-sm">강점</span>
                            <span className="text-orange-400 px-2 py-1 bg-orange-900/30 rounded text-sm">보완할 점</span>
                        </div>
                    </div>
                    {/* ✅ 하이라이트 텍스트 렌더링 */}
                    <div ref={resumeViewerRef} className="flex-1 overflow-y-auto custom-scrollbar bg-[#1A1B1E] rounded-xl p-6 border border-white/5 shadow-inner leading-relaxed">
                        {resumeText ? renderHighlightedText(resumeText) : <div className="text-center text-gray-500 py-10 text-sm">이력서 내용이 없습니다.</div>}
                    </div>
                </section>
                <section className="flex-1 bg-[#212226] border border-white/5 rounded-[24px] p-6 flex flex-col overflow-hidden">
                    <h3 className="text-sm font-bold text-purple-400 mb-3 uppercase flex items-center gap-2 shrink-0"><HelpCircle size={16}/> AI 예상 질문</h3>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                        {analysisData?.question ? parseQuestions(analysisData.question).map((q, i) => (
                            <div key={i} className="bg-purple-500/5 border border-purple-500/10 p-3 rounded-xl flex gap-3">
                                <span className="text-purple-400 font-bold text-xs mt-0.5">Q{i+1}</span>
                                <p className="text-gray-300 text-sm">{q}</p>
                            </div>
                        )) : <div className="h-full flex items-center justify-center text-gray-500 text-xs">분석 완료 시 질문이 표시됩니다.</div>}
                    </div>
                </section>
            </div>

            {/* 우측 패널 */}
            <div className="lg:col-span-3 h-full min-h-0 flex flex-col">
                <section className="flex-1 bg-[#212226] border border-white/5 rounded-[24px] p-5 flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center mb-4 shrink-0">
                        <h3 className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2"><CheckCircle2 size={14}/> 이력서 세부 분석</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                        {isLoadingAnalysis ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"/> <span className="text-xs">분석 중...</span></div>
                        ) : currentFeedbacks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2"><Info size={20}/><span className="text-xs">데이터 없음</span></div>
                        ) : (
                            currentFeedbacks.map(fb => (
                                <div 
                                    key={fb.id} 
                                    onClick={() => handleFeedbackClick(fb.id)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                                        clickedFeedbackId === fb.id 
                                        ? (fb.type === 'strength' ? 'bg-blue-900/20 border-blue-500 ring-1 ring-blue-500' : fb.type === 'matching' ? 'bg-green-900/20 border-green-500 ring-1 ring-green-500' : 'bg-orange-900/20 border-orange-500 ring-1 ring-orange-500')
                                        : 'bg-white/5 border-transparent hover:bg-white/10'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        {fb.type === 'strength' && <TrendingUp size={14} className="text-blue-400"/>}
                                        {fb.type === 'matching' && <CheckCircle2 size={14} className="text-green-400"/>}
                                        {fb.type === 'improvement' && <AlertCircle size={14} className="text-orange-400"/>}
                                        <span className={`text-xs font-bold uppercase ${fb.type==='strength'?'text-blue-400':fb.type==='matching'?'text-green-400':'text-orange-400'}`}>
                                            {fb.type === 'strength' ? 'Strength' : fb.type === 'matching' ? 'Fit' : 'Suggestion'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-200">{fb.comment}</p>
                                    {clickedFeedbackId !== fb.id && <div className="text-right mt-1"><Info size={10} className="inline text-gray-600"/></div>}
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </motion.div>
    );
}