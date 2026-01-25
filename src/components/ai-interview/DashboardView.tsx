'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, TrendingUp, AlertCircle, HelpCircle, Briefcase, Hash, ChevronRight, Info, Search, X } from 'lucide-react';
import { fetchAllTechStacks } from '@/services/trendService';
import { api } from '@/lib/api';

interface DashboardViewProps {
    resumeTitle: string;
    resumeText?: string | null;
    resumeId?: number;
    resumeKeywords: string[];
    sortedCompanies: any[];
    selectedCompany: any;
    setSelectedCompany: (c: any) => void;
    toggleFavorite: (e: any, id: number) => void;
    matchScore: number;
    onOpenReport: () => void;
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
    resumeTitle, resumeText, resumeId, resumeKeywords, sortedCompanies, selectedCompany, setSelectedCompany, toggleFavorite, matchScore, onOpenReport
}: DashboardViewProps) {
    const [activeFeedbackId, setActiveFeedbackId] = useState<string | null>(null);
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
    const [companySearchQuery, setCompanySearchQuery] = useState('');
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [searchResults, setSearchResults] = useState<CompanyWithJobPosting[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    
    const [techLogos, setTechLogos] = useState<Record<string, string>>({});

    // 1. 기술 스택 로고 로딩
    useEffect(() => {
        const loadTechLogos = async () => {
            try {
                const stacks = await fetchAllTechStacks();
                const logoMap: Record<string, string> = {};
                stacks.forEach(stack => {
                    if (stack.logo) {
                        logoMap[stack.name.toLowerCase()] = stack.logo;
                    }
                });
                setTechLogos(logoMap);
            } catch (error) {
                console.error("기술 스택 로고 로딩 실패:", error);
            }
        };
        loadTechLogos();
    }, []);

    // 2. 기업 목록 및 채용공고 로딩
    useEffect(() => {
        const loadFavoriteCompaniesWithJobs = async () => {
            setIsLoadingCompanies(true);
            try {
                let analyzedJobPostingIds = new Set<number>();
                let analyzedCorpIds = new Set<number>();
                if (resumeId) {
                    try {
                        const matchingsResponse = await api.get('/resumes/matchings/');
                        const matchings = matchingsResponse.data.results || matchingsResponse.data || [];
                        matchings.forEach((matching: any) => {
                            if (matching.resume === resumeId) {
                                analyzedJobPostingIds.add(matching.job_posting);
                                if (matching.job_posting_corp_id != null) analyzedCorpIds.add(matching.job_posting_corp_id);
                            }
                        });
                    } catch (error) {
                        console.log('분석된 채용공고 목록 가져오기 실패:', error);
                    }
                }

                const bookmarksResponse = await api.get('/jobs/corp-bookmarks/');
                const bookmarks = bookmarksResponse.data.results || bookmarksResponse.data || [];
                const favoriteCorpIds = new Set(bookmarks.map((b: any) => b.corp?.id ?? b.corp_id).filter(Boolean));

                const allCorpIds = new Set([...Array.from(favoriteCorpIds), ...Array.from(analyzedCorpIds)]);
                
                if (allCorpIds.size === 0) {
                    setCompaniesWithJobs([]);
                    setIsLoadingCompanies(false);
                    return;
                }

                const companiesData = await Promise.all(
                    Array.from(allCorpIds).map(async (corpId) => {
                        const corpIdNum = Number(corpId);
                        if (isNaN(corpIdNum)) return null;
                        try {
                            let corp = bookmarks.find((b: any) => b.corp?.id === corpIdNum)?.corp;
                            if (!corp) {
                                const corpResponse = await api.get(`/jobs/corps/${corpIdNum}/`);
                                corp = corpResponse.data;
                            }
                            
                            let jobPostings: any[] = [];
                            let nextUrl: string | null = `/jobs/corps/${corpIdNum}/job-postings/?page_size=500`;
                            
                            while (nextUrl) {
                                const jobsResponse: any = await api.get(nextUrl);
                                let pageJobPostings: any[] = [];
                                if (Array.isArray(jobsResponse.data)) {
                                    pageJobPostings = jobsResponse.data;
                                    nextUrl = null;
                                } else if (jobsResponse.data?.results) {
                                    pageJobPostings = jobsResponse.data.results;
                                    nextUrl = jobsResponse.data.next;
                                    if (nextUrl && !nextUrl.startsWith('http')) nextUrl = nextUrl.startsWith('/') ? nextUrl : `/${nextUrl}`;
                                } else {
                                    nextUrl = null;
                                }
                                jobPostings = [...jobPostings, ...pageJobPostings];
                            }
                            
                            const analyzedJobs = jobPostings.map((job: any) => ({
                                id: job.id,
                                title: job.title,
                                description: job.description,
                                url: job.url,
                                isAnalyzed: analyzedJobPostingIds.has(job.id),
                            }));
                            
                            const isAllAnalyzed = analyzedJobs.length > 0 && analyzedJobs.every((job: any) => job.isAnalyzed);
                            
                            return {
                                id: corp.id,
                                name: corp.name,
                                logo_url: corp.logo_url,
                                address: corp.address,
                                jobPostings: analyzedJobs,
                                isAllAnalyzed,
                            };
                        } catch (error) {
                            return null;
                        }
                    })
                );

                const validCompanies = companiesData.filter(c => c && (c.jobPostings.length > 0 || c.jobPostings.some((j:any) => j.isAnalyzed))) as CompanyWithJobPosting[];
                
                const companiesWithAnalyzedJobs = validCompanies.filter(c => c.jobPostings.some((job: any) => job.isAnalyzed));
                const companiesWithoutAnalyzedJobs = validCompanies.filter(c => !c.jobPostings.some((job: any) => job.isAnalyzed));
                
                setCompaniesWithJobs([...companiesWithAnalyzedJobs, ...companiesWithoutAnalyzedJobs]);
            } catch (error) {
                console.error('기업 목록 로딩 실패:', error);
                setCompaniesWithJobs([]);
            } finally {
                setIsLoadingCompanies(false);
            }
        };

        if (!isSearchMode) {
            loadFavoriteCompaniesWithJobs();
        }
    }, [isSearchMode, resumeId]);

    // 3. 기업 검색 기능
    useEffect(() => {
        const searchCompanies = async () => {
            if (!companySearchQuery || !companySearchQuery.trim()) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                let analyzedJobPostingIds = new Set<number>();
                if (resumeId) {
                    try {
                        const matchingsResponse = await api.get('/resumes/matchings/');
                        const matchings = matchingsResponse.data.results || matchingsResponse.data || [];
                        matchings.forEach((matching: any) => {
                            if (matching.resume === resumeId) analyzedJobPostingIds.add(matching.job_posting);
                        });
                    } catch (e) {}
                }

                const searchUrl = `/jobs/corps/?corp_name=${encodeURIComponent(companySearchQuery.trim())}`;
                const response = await api.get(searchUrl);
                const corps = response.data || [];

                const companiesData = await Promise.all(
                    corps.map(async (corp: any) => {
                        try {
                            let jobPostings: any[] = [];
                            let nextUrl: string | null = `/jobs/corps/${corp.id}/job-postings/?page_size=500`;
                            while (nextUrl) {
                                const jobsResponse: any = await api.get(nextUrl);
                                let pageJobPostings: any[] = [];
                                if (Array.isArray(jobsResponse.data)) {
                                    pageJobPostings = jobsResponse.data;
                                    nextUrl = null;
                                } else if (jobsResponse.data?.results) {
                                    pageJobPostings = jobsResponse.data.results;
                                    nextUrl = jobsResponse.data.next;
                                    if (nextUrl && !nextUrl.startsWith('http')) nextUrl = nextUrl.startsWith('/') ? nextUrl : `/${nextUrl}`;
                                } else {
                                    nextUrl = null;
                                }
                                jobPostings = [...jobPostings, ...pageJobPostings];
                            }
                            
                            const analyzedJobs = jobPostings.map((job: any) => ({
                                id: job.id,
                                title: job.title,
                                description: job.description,
                                url: job.url,
                                isAnalyzed: analyzedJobPostingIds.has(job.id),
                            }));
                            
                            const isAllAnalyzed = analyzedJobs.length > 0 && analyzedJobs.every((job: any) => job.isAnalyzed);

                            return {
                                id: corp.id,
                                name: corp.name,
                                logo_url: corp.logo_url,
                                address: corp.address,
                                jobPostings: analyzedJobs,
                                isAllAnalyzed,
                            };
                        } catch (error) {
                            return { id: corp.id, name: corp.name, logo_url: corp.logo_url, address: corp.address, jobPostings: [] };
                        }
                    })
                );

                const companiesWithJobs = companiesData.filter(c => c.jobPostings.length > 0);
                setSearchResults(companiesWithJobs);
            } catch (error: any) {
                console.error('기업 검색 실패:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            if (isSearchMode) searchCompanies();
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [companySearchQuery, isSearchMode, resumeId]);

    // 4. 분석 상태 업데이트 (로컬)
    const updateJobPostingAnalyzedStatus = useCallback((jobPostingId: number, isAnalyzed: boolean) => {
        const updater = (prev: CompanyWithJobPosting[]) => prev.map(company => {
            const updatedJobPostings = company.jobPostings.map(job => 
                job.id === jobPostingId ? { ...job, isAnalyzed } : job
            );
            const isAllAnalyzed = updatedJobPostings.length > 0 && updatedJobPostings.every(job => job.isAnalyzed);
            return { ...company, jobPostings: updatedJobPostings, isAllAnalyzed };
        });
        
        setCompaniesWithJobs(updater);
        setSearchResults(updater);
    }, []);

    // 5. 분석 데이터 가져오기
    useEffect(() => {
        const fetchAnalysis = async () => {
            if (!resumeId || !selectedJobPostingId) {
                setAnalysisData(null);
                setIsLoadingAnalysis(false);
                return;
            }

            setAnalysisData(null);
            setIsLoadingAnalysis(true);

            try {
                let existingMatching = null;
                try {
                    const matchingsResponse = await api.get('/resumes/matchings/');
                    const matchings = matchingsResponse.data.results || matchingsResponse.data || [];
                    existingMatching = matchings.find((m: any) => 
                        m.resume === resumeId && m.job_posting === selectedJobPostingId
                    );
                } catch (e) { /* 무시 */ }

                if (existingMatching) {
                    setAnalysisData({
                        positive_feedback: existingMatching.positive_feedback,
                        negative_feedback: existingMatching.negative_feedback,
                        enhancements_feedback: existingMatching.enhancements_feedback,
                        question: existingMatching.question,
                    });
                    updateJobPostingAnalyzedStatus(selectedJobPostingId, true);
                    setIsLoadingAnalysis(false);
                    return;
                }

                console.log(`[DashboardView] 분석 요청 시작: Resume(${resumeId}) -> Job(${selectedJobPostingId})`);
                const response = await api.post(`/resumes/${resumeId}/match/${selectedJobPostingId}/`);
                
                console.log("[DashboardView] 분석 성공:", response.data);
                
                setAnalysisData({
                    positive_feedback: response.data.positive_feedback,
                    negative_feedback: response.data.negative_feedback,
                    enhancements_feedback: response.data.enhancements_feedback,
                    question: response.data.question,
                });
                
                updateJobPostingAnalyzedStatus(selectedJobPostingId, true);

            } catch (error: any) {
                console.error("🚨 분석 API 호출 실패:", error);
                if (error.response) {
                    console.error("❌ 서버 상태 코드:", error.response.status);
                    console.error("❌ 서버 응답 데이터:", error.response.data);
                    if (error.response.status === 500) {
                        alert(`서버 내부 오류가 발생했습니다.\n(원인: ${JSON.stringify(error.response.data).slice(0, 100)}...)`);
                    }
                } else {
                    console.error("❌ 네트워크 오류 또는 응답 없음");
                }
                setAnalysisData(null);
            } finally {
                setIsLoadingAnalysis(false);
            }
        };

        fetchAnalysis();
    }, [resumeId, selectedJobPostingId, updateJobPostingAnalyzedStatus]);

    const currentFeedbacks = useMemo((): AnalysisFeedback[] => {
        if (!analysisData) return [];
        const feedbacks: AnalysisFeedback[] = [];

        if (analysisData.positive_feedback) feedbacks.push({ id: 'positive', type: 'strength', comment: analysisData.positive_feedback });
        if (analysisData.negative_feedback) feedbacks.push({ id: 'negative', type: 'improvement', comment: analysisData.negative_feedback });
        if (analysisData.enhancements_feedback) feedbacks.push({ id: 'enhancements', type: 'improvement', comment: analysisData.enhancements_feedback });

        return feedbacks;
    }, [analysisData]);

    const getHighlightStyle = (type: string, isActive: boolean) => {
        switch (type) {
            case 'strength': return isActive ? 'bg-blue-500/30 text-blue-200 underline decoration-blue-500 decoration-2' : 'text-blue-400 underline decoration-blue-500/50 decoration-2 hover:bg-blue-500/20';
            case 'matching': return isActive ? 'bg-green-500/30 text-green-200 underline decoration-green-500 decoration-2' : 'text-green-400 underline decoration-green-500/50 decoration-2 hover:bg-green-500/20';
            case 'improvement': return isActive ? 'bg-orange-500/30 text-orange-200 underline decoration-orange-500 decoration-2' : 'text-orange-400 underline decoration-orange-500/50 decoration-2 hover:bg-orange-500/20';
            default: return '';
        }
    };

    const renderHighlightedText = (text: string) => {
        let parts: Array<{ text: string; type: string; id: string }> = [{ text, type: 'normal', id: '0' }];
        currentFeedbacks.forEach((fb) => {
            const newParts: Array<{ text: string; type: string; id: string }> = [];
            parts.forEach((part) => {
                if (part.type !== 'normal') {
                    newParts.push(part);
                    return;
                }
                if (fb.targetText) {
                    const split = part.text.split(fb.targetText);
                    if (split.length > 1) {
                        newParts.push({ text: split[0], type: 'normal', id: '0' });
                        newParts.push({ text: fb.targetText, type: fb.type, id: fb.id });
                        newParts.push({ text: split[1], type: 'normal', id: '0' });
                    } else newParts.push(part);
                } else newParts.push(part);
            });
            parts = newParts;
        });

        return (
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-base">
                {parts.map((part, idx) => part.type === 'normal' ? <span key={idx}>{part.text}</span> : (
                    <span key={idx} className={`relative font-bold cursor-pointer transition-all px-0.5 rounded ${getHighlightStyle(part.type, activeFeedbackId === part.id)}`} onMouseEnter={() => setActiveFeedbackId(part.id)} onMouseLeave={() => setActiveFeedbackId(null)}>{part.text}</span>
                ))}
            </p>
        );
    };

    return (
        // ✅ [수정] h-full과 min-h-0을 사용하여 레이아웃이 화면 밖으로 밀려나지 않게 고정
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full items-start h-[calc(100vh-140px)] min-h-[600px]">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-3 flex flex-col gap-4 h-full min-h-0">
                {/* 1. 기업 목록 */}
                <section className="flex-1 bg-[#212226] border border-white/5 rounded-[24px] p-5 flex flex-col overflow-hidden min-h-0">
                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                        <h3 className="text-sm font-bold text-gray-400 flex items-center gap-2 uppercase tracking-wider"><Briefcase size={14} /> {isSearchMode ? '기업 검색' : '즐겨찾기 기업'}</h3>
                        <button onClick={() => { setIsSearchMode(!isSearchMode); setCompanySearchQuery(''); setSearchResults([]); }} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">{isSearchMode ? '즐겨찾기' : '검색'}</button>
                    </div>
                    {isSearchMode && (
                        <div className="relative mb-4 flex-shrink-0">
                            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input type="text" value={companySearchQuery} onChange={(e) => setCompanySearchQuery(e.target.value)} placeholder="기업명 검색" className="w-full pl-10 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50" />
                            {companySearchQuery && <button onClick={() => setCompanySearchQuery('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"><X size={16} /></button>}
                        </div>
                    )}
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 min-h-0">
                        {isSearchMode ? (
                            isSearching ? <div className="flex items-center justify-center h-full text-gray-500"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div></div> :
                            searchResults.length === 0 ? <div className="flex items-center justify-center h-full text-gray-500 text-xs">{companySearchQuery.trim() ? '검색 결과가 없습니다.' : '기업명을 입력해주세요.'}</div> :
                            searchResults.map((company) => (
                                <div key={company.id} className="space-y-1">
                                    <div onClick={() => { if(company.jobPostings.length > 0) { setSelectedJobPostingId(company.jobPostings[0].id); setSelectedCompany({...company, jobPostingId: company.jobPostings[0].id, jobPostingTitle: company.jobPostings[0].title}); }}} className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 select-none ${selectedCompany?.id === company.id ? 'bg-green-600/20 border-green-500/50' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                                        <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center shrink-0">{company.logo_url ? <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain" /> : <span className="text-xs text-gray-400">{company.name.charAt(0)}</span>}</div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className={`text-sm font-bold truncate ${selectedCompany?.id === company.id ? 'text-green-100' : 'text-gray-300'}`}>{company.name}</h4>
                                            <div className="flex items-center gap-2"><p className="text-xs text-gray-500 truncate">{company.jobPostings.length}개 채용공고</p>{company.isAllAnalyzed && <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30 shrink-0">전체 분석완료</span>}{!company.isAllAnalyzed && company.jobPostings.length === 1 && company.jobPostings[0].isAnalyzed && <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30 shrink-0">분석완료</span>}</div>
                                        </div>
                                    </div>
                                    {(selectedCompany?.id === company.id || company.jobPostings.some((job: any) => job.id === selectedJobPostingId)) && company.jobPostings.length > 1 && (
                                        <div className="ml-4 space-y-1">{company.jobPostings.map((job: any) => (
                                            <div key={job.id} onClick={(e) => { e.stopPropagation(); setSelectedJobPostingId(job.id); setSelectedCompany({...company, jobPostingId: job.id, jobPostingTitle: job.title}); }} className={`p-2 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between gap-2 ${selectedJobPostingId === job.id ? 'bg-blue-600/20 border-blue-500/50 text-blue-100' : 'bg-white/5 border-transparent hover:bg-white/10 text-gray-400'}`}>
                                                <p className="truncate flex-1">{job.title}</p>{job.isAnalyzed && <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30 shrink-0">분석완료</span>}
                                            </div>
                                        ))}</div>
                                    )}
                                </div>
                            ))
                        ) : (
                            isLoadingCompanies ? <div className="flex items-center justify-center h-full text-gray-500"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div></div> :
                            companiesWithJobs.length === 0 ? <div className="flex flex-col items-center justify-center h-full text-gray-500 text-xs gap-2"><Info size={24} /><span>즐겨찾기한 기업이 없습니다.</span></div> :
                            companiesWithJobs.map((company) => (
                                <div key={company.id} className="space-y-1">
                                    <div onClick={() => { if(company.jobPostings.length > 0) { setSelectedJobPostingId(company.jobPostings[0].id); setSelectedCompany({...company, jobPostingId: company.jobPostings[0].id, jobPostingTitle: company.jobPostings[0].title}); }}} className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 select-none ${selectedCompany?.id === company.id ? 'bg-green-600/20 border-green-500/50' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                                        <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center shrink-0">{company.logo_url ? <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain" /> : <span className="text-xs text-gray-400">{company.name.charAt(0)}</span>}</div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className={`text-sm font-bold truncate ${selectedCompany?.id === company.id ? 'text-green-100' : 'text-gray-300'}`}>{company.name}</h4>
                                            <div className="flex items-center gap-2"><p className="text-xs text-gray-500 truncate">{company.jobPostings.length}개 채용공고</p>{company.isAllAnalyzed && <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30 shrink-0">전체 분석완료</span>}{!company.isAllAnalyzed && company.jobPostings.length === 1 && company.jobPostings[0].isAnalyzed && <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30 shrink-0">분석완료</span>}</div>
                                        </div>
                                    </div>
                                    {(selectedCompany?.id === company.id || company.jobPostings.some((job: any) => job.id === selectedJobPostingId)) && company.jobPostings.length > 1 && (
                                        <div className="ml-4 space-y-1">{company.jobPostings.map((job: any) => (
                                            <div key={job.id} onClick={(e) => { e.stopPropagation(); setSelectedJobPostingId(job.id); setSelectedCompany({...company, jobPostingId: job.id, jobPostingTitle: job.title}); }} className={`p-2 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between gap-2 ${selectedJobPostingId === job.id ? 'bg-blue-600/20 border-blue-500/50 text-blue-100' : 'bg-white/5 border-transparent hover:bg-white/10 text-gray-400'}`}>
                                                <p className="truncate flex-1">{job.title}</p>{job.isAnalyzed && <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30 shrink-0">분석완료</span>}
                                            </div>
                                        ))}</div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </section>
                
                {/* 2. 내 키워드 (높이 고정) */}
                <section className="h-[220px] shrink-0 bg-[#212226] border border-white/5 rounded-[24px] p-5 flex flex-col">
                    <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2 uppercase tracking-wider"><Hash size={14} /> My Tech Stack</h3>
                    <div className="flex flex-wrap gap-2 content-start overflow-y-auto custom-scrollbar">
                        {resumeKeywords.map((k, i) => {
                            const logoUrl = techLogos[k.toLowerCase()];
                            return (
                                <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-gray-300 flex items-center gap-2 transition-colors hover:bg-white/10">
                                    {logoUrl && <img src={logoUrl} alt={k} className="w-4 h-4 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
                                    {k}
                                </span>
                            );
                        })}
                    </div>
                </section>
            </div>

            {/* CENTER COLUMN */}
            <div className="lg:col-span-6 flex flex-col gap-4 h-full min-h-0">
                {/* 3. 이력서 뷰어 (높이 55% 차지) */}
                <section className="h-[55%] bg-[#212226] border border-white/5 rounded-[24px] p-8 flex flex-col relative overflow-hidden group min-h-0">
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${selectedCompany ? 'from-blue-500 via-green-500 to-orange-500' : 'from-blue-500 to-orange-500'} opacity-50`} />
                    <div className="flex justify-between items-center mb-6 flex-shrink-0">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><FileText size={18} className="text-blue-400" /> {resumeTitle}</h3>
                        <div className="flex gap-3 text-xs font-bold">
                             <span className="flex items-center gap-1.5 text-blue-400"><span className="w-2 h-2 rounded-full bg-blue-500"></span> 강점</span>
                             <span className="flex items-center gap-1.5 text-orange-400"><span className="w-2 h-2 rounded-full bg-orange-500"></span> 보완점</span>
                             {selectedCompany && <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1.5 text-green-400"><span className="w-2 h-2 rounded-full bg-green-500"></span> 기업 적합</motion.span>}
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#1A1B1E] rounded-xl p-6 border border-white/5 shadow-inner min-h-0">
                        {resumeText ? renderHighlightedText(resumeText) : <div className="text-gray-400 text-sm text-center py-8">이력서 텍스트를 불러오는 중이거나 텍스트가 없습니다.</div>}
                    </div>
                </section>
                
                {/* 4. AI 면접 질문 (✅ h-full, min-h-0으로 부모 높이 따르고 스크롤바 생성 보장) */}
                <section className="flex-1 bg-[#212226] border border-white/5 rounded-[24px] p-6 flex flex-col overflow-hidden min-h-0 h-full">
                    <h3 className="text-sm font-bold text-purple-400 mb-4 flex items-center gap-2 uppercase tracking-wider flex-shrink-0">
                        <HelpCircle size={16} /> AI 면접 질문
                    </h3>
                    
                    {/* flex-col을 추가하여 내부 컨텐츠가 높이를 가득 채울 수 있게 함 */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 flex flex-col">
                        {(() => {
                            if (analysisData?.question) {
                                const questions = analysisData.question.split('\n').map(q => q.trim()).filter(q => q.length > 0 && q.startsWith('-')).map(q => q.substring(1).trim());
                                if (questions.length > 0) {
                                    return (
                                        <div className="space-y-3">
                                            {questions.map((question, index) => (
                                                <div key={index} className="bg-purple-500/5 border border-purple-500/10 p-4 rounded-xl flex gap-3 hover:bg-purple-500/10 transition-colors">
                                                    <span className="flex items-center justify-center w-5 h-5 rounded bg-purple-500/20 text-purple-400 text-xs font-bold shrink-0">Q{index + 1}</span>
                                                    <p className="text-gray-200 text-sm font-medium">{question}</p>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                }
                            }
                            // 중앙 정렬을 위해 flex-1과 h-full 적용
                            return (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-2 h-full">
                                    <Info size={24} />
                                    <span className="text-xs">
                                        {selectedJobPostingId ? '채용공고를 선택하면 AI 면접 질문이 생성됩니다.' : '채용공고를 선택하면 AI 면접 질문이 표시됩니다.'}
                                    </span>
                                </div>
                            );
                        })()}
                    </div>
                </section>
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-3 flex flex-col gap-4 h-full min-h-0">
                {/* 5. 상세 피드백 리스트 (✅ flex-1, min-h-0) */}
                <section className="flex-1 bg-[#212226] border border-white/5 rounded-[24px] p-5 flex flex-col overflow-hidden min-h-0">
                    <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <h3 className="text-sm font-bold text-gray-400 flex items-center gap-2 uppercase tracking-wider"><CheckCircle2 size={14} /> Analysis Details</h3>
                        {selectedCompany && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">{selectedCompany.name || selectedCompany.jobPostingTitle} Fit</span>}
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1 min-h-0">
                        {isLoadingAnalysis ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div><span className="text-sm font-medium">분석 중입니다...</span><span className="text-xs text-gray-600">이력서와 채용공고를 분석하고 있습니다.</span></div>
                        ) : currentFeedbacks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2"><Info size={24} /><span className="text-xs">분석 데이터가 없습니다.</span></div>
                        ) : (
                            currentFeedbacks.map((fb) => (
                                <div key={fb.id} onMouseEnter={() => setActiveFeedbackId(fb.id)} onMouseLeave={() => setActiveFeedbackId(null)} className={`p-4 rounded-xl border transition-all cursor-pointer relative select-none ${fb.type === 'strength' ? (activeFeedbackId === fb.id ? 'bg-blue-500/10 border-blue-500/50' : 'bg-blue-500/5 border-blue-500/10') : fb.type === 'matching' ? (activeFeedbackId === fb.id ? 'bg-green-500/10 border-green-500/50 ring-1 ring-green-500/30' : 'bg-green-500/5 border-green-500/10') : (activeFeedbackId === fb.id ? 'bg-orange-500/10 border-orange-500/50' : 'bg-orange-500/5 border-orange-500/10')}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {fb.type === 'strength' && <TrendingUp size={14} className="text-blue-400" />}{fb.type === 'matching' && <CheckCircle2 size={14} className="text-green-400" />}{fb.type === 'improvement' && <AlertCircle size={14} className="text-orange-400" />}
                                        <span className={`text-xs font-bold uppercase ${fb.type === 'strength' ? 'text-blue-400' : fb.type === 'matching' ? 'text-green-400' : 'text-orange-400'}`}>{fb.type === 'strength' ? 'Strength' : fb.type === 'matching' ? 'Company Fit' : 'Suggestion'}</span>
                                    </div>
                                    {fb.type === 'matching' && <div className="mb-2 text-[10px] text-green-300 bg-green-900/30 px-2 py-1 rounded inline-block">🎯 기업 가치관 / 프로젝트 매칭</div>}
                                    <p className="text-xs text-gray-500 mb-2 line-clamp-1 italic">"{fb.targetText}"</p>
                                    <p className="text-sm text-gray-200 leading-snug font-medium">{fb.comment}</p>
                                </div>
                            ))
                        )}
                    </div>
                </section>
                {/* 6. 통합 리포트 버튼 (높이 고정) */}
                <button onClick={onOpenReport} className="h-16 shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-[24px] flex items-center justify-center gap-4 shadow-xl shadow-blue-900/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] group">
                    <div className="bg-white/10 p-2.5 rounded-xl group-hover:bg-white/20 transition-colors"><FileText size={24} className="text-white" /></div>
                    <div className="text-left"><p className="font-bold text-lg leading-none">통합 리포트 확인</p><p className="text-xs text-blue-200 mt-1 opacity-80">상세 분석 및 PDF 저장</p></div>
                    <ChevronRight size={20} className="text-white/50 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </motion.div>
    );
}