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
      setError(null);
      // multipart/form-data는 Content-Type을 명시하지 않아야 axios가 자동으로 boundary를 설정합니다
      await api.post("/resumes/", formData);
      alert("이력서가 업로드되었습니다!");
      fetchResumes();
    } catch (err: any) {
      console.error("이력서 업로드 실패:", err);
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || "이력서 업로드에 실패했습니다.";
      setError(errorMessage);
    } finally {
      setUploading(false);
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
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <header className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-50">이력서 관리</h2>
        
        {/* 업로드 버튼 */}
        <label className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700 active:scale-95">
          {uploading ? "업로드 중..." : "+ 이력서 업로드"}
          <input
            type="file"
            accept=".pdf"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </header>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          ⚠️ {error}
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
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/50 p-5 transition-all hover:border-zinc-700"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  {/* PDF 아이콘 */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-white">{resume.resume_title}</h3>
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
          <li><strong>AI 통합 리포트</strong> 버튼을 클릭하면 AI 면접 페이지에서 상세한 분석 결과를 확인할 수 있습니다.</li>
        </ul>
      </div>
    </div>
  );
}
