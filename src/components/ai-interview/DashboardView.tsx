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
                const favoriteCorpIds = bookmarks.map((b:any) => b.corp?.id ?? b.corp_id).filter(Boolean);
                
                if (favoriteCorpIds.length === 0) {
                    setCompaniesWithJobs([]);
                    setIsLoadingCompanies(false);
                    return;
                }

                const companiesData = await Promise.all(favoriteCorpIds.map(async (id: number) => {
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
                                isAnalyzed: false
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
    }, [companyListTab, resumeId]);

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
                        jobPostings: jobPostings.map((j:any) => ({...j, isAnalyzed: false})), 
                        isAllAnalyzed: false 
                    };
                }));
                setSearchResults(results);
            } catch { setSearchResults([]); }
            finally { setIsSearching(false); }
        };
        const timer = setTimeout(() => { if (companyListTab === 'search') searchCompanies(); }, 300);
        return () => clearTimeout(timer);
    }, [companySearchQuery, companyListTab]);

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

    // ✅ [수정] 타겟 텍스트 추출 로직 강화
    const extractTargetText = (text: string) => {
        // 1. 따옴표로 감싸진 텍스트
        const quoteMatch = text.match(/(?:'|")([^'"]{3,})(?:'|")/);
        if (quoteMatch) return quoteMatch[1];
        
        // 2. 콜론(:) 뒤의 텍스트
        const colonMatch = text.split(/:\s*/);
        if (colonMatch.length > 1) return colonMatch[1];

        // 3. 문장 전체 반환 (단, 너무 길면 앞부분만 자를 수도 있으나 일단 전체 반환)
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

    // ✅ [핵심 수정] 하이라이트 스타일을 즉시 적용 (애니메이션 최소화)
    const getHighlightStyle = (type: string) => {
        switch (type) {
            case 'strength': return { backgroundColor: 'rgba(37, 99, 235, 0.3)', fontWeight: 'bold', borderRadius: '4px', padding: '2px 0' };
            case 'matching': return { backgroundColor: 'rgba(22, 163, 74, 0.3)', fontWeight: 'bold', borderRadius: '4px', padding: '2px 0' };
            case 'improvement': return { backgroundColor: 'rgba(234, 88, 12, 0.3)', fontWeight: 'bold', borderRadius: '4px', padding: '2px 0' };
            default: return {};
        }
    };

    // ✅ [핵심 수정] 정규식 기반의 강력한 텍스트 렌더링
    const renderHighlightedText = (text: string) => {
        const activeFeedback = currentFeedbacks.find(fb => fb.id === clickedFeedbackId);
        
        if (!activeFeedback || !activeFeedback.targetText) {
            return <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm lg:text-base font-light">{text}</div>;
        }

        // 1. Target Text의 특수문자 이스케이프 및 공백 유연화
        // 예: "Docker\nContainer" 와 "Docker Container"를 같게 취급
        const escapedTarget = activeFeedback.targetText
            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // 특수문자 처리
            .replace(/\s+/g, '[\\s\\n\\r]+'); // 모든 공백을 정규식 공백으로 치환

        // 2. 정규식 생성 (대소문자 무시)
        const regex = new RegExp(`(${escapedTarget})`, 'gi');
        const parts = text.split(regex);

        // 3. 매칭 실패 시 Fallback (문장 단위 유사도)
        if (parts.length === 1) {
             const sentences = text.match(/[^.!?\n]+[.!?\n]+/g) || [text];
             const targetWords = activeFeedback.targetText.replace(/[^\w\s가-힣]/g, '').split(/\s+/).filter(w => w.length > 1);
             
             return (
                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm lg:text-base font-light">
                    {sentences.map((sentence, i) => {
                        const matchCount = targetWords.filter(w => sentence.includes(w)).length;
                        const isMatch = targetWords.length > 0 && (matchCount / targetWords.length) > 0.4;
                        
                        return (
                            <span 
                                key={i} 
                                id={isMatch ? "highlighted-part" : undefined}
                                style={isMatch ? getHighlightStyle(activeFeedback.type) : {}}
                            >
                                {sentence}
                            </span>
                        );
                    })}
                </div>
             );
        }

        return (
            <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm lg:text-base font-light">
                {parts.map((part, i) => {
                    const isMatch = part.match(regex);
                    return (
                        <span 
                            key={i} 
                            id={isMatch ? "highlighted-part" : undefined}
                            style={isMatch ? getHighlightStyle(activeFeedback.type) : {}}
                        >
                            {part}
                        </span>
                    );
                })}
            </div>
        );
    };

    // 자동 스크롤
    useEffect(() => {
        if (clickedFeedbackId) {
            setTimeout(() => {
                const el = document.getElementById('highlighted-part');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
                <section className="flex-1 bg-[#212226] border border-white/5 rounded-[24px] p-5 flex flex-col overflow-hidden">
                    <div className="flex bg-black/20 p-1 rounded-lg mb-4 shrink-0">
                        <button onClick={() => setCompanyListTab('favorites')} className={`flex-1 py-1.5 text-xs font-bold rounded-md ${companyListTab === 'favorites' ? 'bg-white/10 text-white' : 'text-gray-500'}`}>즐겨찾기</button>
                        <button onClick={() => setCompanyListTab('search')} className={`flex-1 py-1.5 text-xs font-bold rounded-md ${companyListTab === 'search' ? 'bg-white/10 text-white' : 'text-gray-500'}`}>검색</button>
                    </div>
                    {companyListTab === 'search' && (
                        <div className="relative mb-3 shrink-0">
                            <input type="text" value={companySearchQuery} onChange={(e) => setCompanySearchQuery(e.target.value)} placeholder="기업명 검색" className="w-full pl-9 pr-8 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            {companySearchQuery && <button onClick={() => setCompanySearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={14}/></button>}
                        </div>
                    )}
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                        {(companyListTab === 'favorites' ? companiesWithJobs : searchResults).map(company => (
                            <div key={company.id} className="space-y-1">
                                <div onClick={(e) => toggleCompanyExpand(e, company.id)} className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer hover:bg-white/5 ${selectedCompany?.id === company.id ? 'border-white/20 bg-white/5' : 'border-transparent'}`}>
                                    <div className="w-8 h-8 rounded bg-white p-1 flex items-center justify-center shrink-0">
                                        {company.logo_url ? <img src={company.logo_url} alt="" className="w-full h-full object-contain"/> : <span className="text-black font-bold text-xs">{company.name[0]}</span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-gray-200 truncate">{company.name}</div>
                                        <div className="text-[10px] text-gray-500">{company.jobPostings.length}개 공고</div>
                                    </div>
                                    <ChevronDown size={14} className={`text-gray-500 transition-transform ${expandedCompanyIds.has(company.id) ? 'rotate-180' : ''}`} />
                                </div>
                                <AnimatePresence>
                                    {expandedCompanyIds.has(company.id) && (
                                        <motion.div initial={{height:0}} animate={{height:'auto'}} exit={{height:0}} className="overflow-hidden ml-2 pl-2 border-l border-white/10 space-y-1">
                                            {company.jobPostings.map(job => (
                                                <div key={job.id} onClick={(e) => { e.stopPropagation(); setSelectedJobPostingId(job.id); setSelectedCompany({...company, jobPostingId: job.id}); }} className={`p-2 rounded text-xs cursor-pointer truncate ${selectedJobPostingId === job.id ? 'text-blue-300 bg-blue-500/10' : 'text-gray-400 hover:text-white'}`}>
                                                    {job.title}
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </section>
                <section className="h-[200px] shrink-0 bg-[#212226] border border-white/5 rounded-[24px] p-5 flex flex-col">
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
                    {/* ref 연결 및 하이라이트 텍스트 렌더링 */}
                    <div ref={resumeViewerRef} className="flex-1 overflow-y-auto custom-scrollbar bg-[#1A1B1E] rounded-xl p-6 border border-white/5 shadow-inner">
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