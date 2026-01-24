"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getAuthTokens } from "@/lib/auth";

// 백엔드 응답 구조를 그대로 사용
interface TechStack {
  id: number;
  name: string;
}

// 백엔드 시리얼라이저 응답 구조 (ResumeSerializer)
interface Resume {
  resume_id: number;
  resume_title: string;
  resume_url: string;
  tech_stacks: { tech_stack: TechStack }[]; // 백엔드 구조: [{tech_stack: {id, name, ...}}]
  created_at: string;
  updated_at: string;
}

export default function ResumesSection() {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analyzingResumeId, setAnalyzingResumeId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 이력서 목록 불러오기
  const fetchResumes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/resumes/");
      
      // 페이지네이션 응답 처리 (results가 있으면 results 사용, 없으면 직접 배열)
      const data = response.data.results || response.data;
      
      // 배열이 아닌 경우 빈 배열로 처리
      if (!Array.isArray(data)) {
        console.error("예상치 못한 응답 형식:", data);
        setResumes([]);
        return;
      }
      
      // 백엔드 응답을 그대로 사용 (변환 없이)
      setResumes(data as Resume[]);
    } catch (err: any) {
      console.error("이력서 목록 불러오기 실패:", err);
      setError(err.response?.data?.error || "이력서 목록을 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { accessToken } = getAuthTokens();
    if (accessToken) {
      fetchResumes();
    } else {
      setError("로그인이 필요합니다.");
      setLoading(false);
    }
  }, []);

  // 이력서 업로드
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("PDF 파일만 업로드 가능합니다.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", file.name.replace(".pdf", ""));

    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);
      
      // 업로드 진행 시뮬레이션 (실제 progress는 onUploadProgress로 추적 가능)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);

      const response = await api.post("/resumes/", formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // 업로드 완료 후 분석 중 상태로 전환
      const newResumeId = response.data?.resume_id || response.data?.id;
      if (newResumeId) {
        setAnalyzingResumeId(newResumeId);
        // 3초 후 분석 중 상태 해제 (실제로는 백엔드에서 상태를 받아와야 함)
        setTimeout(() => {
          setAnalyzingResumeId(null);
        }, 3000);
      }
      
      fetchResumes();
    } catch (err: any) {
      console.error("이력서 업로드 실패:", err);
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || "이력서 업로드에 실패했습니다.";
      setError(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      event.target.value = ""; // input 초기화
    }
  };

  // 이력서 삭제
  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`"${title}" 이력서를 삭제하시겠습니까?`)) return;

    try {
      setError(null);
      await api.delete(`/resumes/${id}/`);
      alert("이력서가 삭제되었습니다.");
      fetchResumes();
    } catch (err: any) {
      console.error("이력서 삭제 실패:", err);
      setError(err.response?.data?.error || "이력서 삭제에 실패했습니다.");
    }
  };

  // AI 통합 리포트 페이지로 이동 (기존 AI 면접 페이지)
  const handleGoToAnalysis = (id: number) => {
    router.push(`/ai-interview?resumeId=${id}`);
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-10 text-center">
        <div className="flex items-center justify-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
          <p className="text-zinc-400">이력서 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 relative">
      {/* 업로드 중 오버레이 */}
      {uploading && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              <h3 className="text-xl font-bold text-white">이력서 업로드 중</h3>
              <p className="text-sm text-zinc-400">
                PDF 파일을 분석하고 있습니다...
              </p>
              <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-zinc-500">{uploadProgress}% 완료</p>
            </div>
          </div>
        </div>
      )}

      <header className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-50">이력서 관리</h2>
        
        {/* 업로드 버튼 */}
        <div className="relative">
          <label className={`cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700 active:scale-95 ${uploading ? 'opacity-80 cursor-not-allowed' : ''}`}>
            {uploading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                업로드 중 {uploadProgress}%
              </span>
            ) : (
              "+ 이력서 업로드"
            )}
            <input
              type="file"
              accept=".pdf"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          
          {/* 업로드 진행 바 */}
          {uploading && (
            <div className="absolute -bottom-1 left-0 right-0 h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      </header>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          ⚠️ {error}
        </div>
      )}

      {/* 분석 중 안내 메시지 */}
      {analyzingResumeId && (
        <div className="mb-4 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 text-sm text-blue-400">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent"></div>
            <div>
              <p className="font-semibold">🤖 AI가 이력서를 분석하고 있습니다</p>
              <p className="text-xs text-blue-300 mt-1">
                분석이 완료되면 기술 스택과 경험이 자동으로 추출됩니다. 다른 페이지로 이동하셔도 백그라운드에서 계속 진행됩니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 이력서 목록 */}
      {resumes.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center rounded-xl bg-white/5 text-zinc-400 text-sm">
          <p>업로드된 이력서가 없습니다.</p>
          <p className="mt-2 text-xs text-zinc-500">PDF 파일을 업로드하여 AI 분석을 시작하세요.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {resumes.map((resume) => (
            <div
              key={resume.resume_id}
              className={`flex items-center justify-between rounded-xl border p-5 transition-all ${
                analyzingResumeId === resume.resume_id
                  ? 'border-blue-500/50 bg-blue-950/20 animate-pulse'
                  : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  {/* PDF 아이콘 */}
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                    analyzingResumeId === resume.resume_id
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {analyzingResumeId === resume.resume_id ? (
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-400 border-t-transparent"></div>
                    ) : (
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white">{resume.resume_title}</h3>
                      {analyzingResumeId === resume.resume_id && (
                        <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-400 border border-blue-500/30 animate-pulse">
                          🔄 AI 분석 중...
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500">
                      {new Date(resume.created_at).toLocaleDateString("ko-KR")} 업로드
                    </p>
                    
                    {/* 기술 스택 태그 */}
                    {resume.tech_stacks && resume.tech_stacks.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {resume.tech_stacks.map((ts) => (
                          <span
                            key={ts.tech_stack.id}
                            className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400"
                          >
                            {ts.tech_stack.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 액션 버튼들 */}
              <div className="flex items-center gap-2">
                {/* AI 통합 리포트 */}
                <button
                  onClick={() => handleGoToAnalysis(resume.resume_id)}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition-all hover:bg-blue-700 active:scale-95"
                >
                  AI 통합 리포트
                </button>

                {/* 삭제 */}
                <button
                  onClick={() => handleDelete(resume.resume_id, resume.resume_title)}
                  className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition-all hover:bg-red-500/20 active:scale-95"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 안내 문구 */}
      <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-xs text-zinc-400">
        <p className="font-semibold text-zinc-300">💡 사용 팁</p>
        <ul className="mt-2 ml-4 space-y-1 list-disc">
          <li>PDF 형식의 이력서만 업로드 가능합니다.</li>
          <li><strong className="text-blue-400">업로드 후 AI 분석</strong>이 자동으로 시작되며, <span className="text-blue-400 font-semibold">🔄 AI 분석 중...</span> 배지가 표시됩니다.</li>
          <li>분석 중에도 다른 페이지로 이동 가능하며, 돌아오면 분석 상태를 확인할 수 있습니다.</li>
          <li><strong>AI 통합 리포트</strong> 버튼을 클릭하면 AI 면접 페이지에서 상세한 분석 결과를 확인할 수 있습니다.</li>
        </ul>
      </div>
    </div>
  );
}
