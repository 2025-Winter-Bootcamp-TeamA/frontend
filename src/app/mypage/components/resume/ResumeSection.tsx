"use client";

import { useRouter } from "next/navigation";
import type { Resume } from "../../_models/resume.types";
import ResumeEmpty from "./ResumeEmpty";
import ResumeList from "./ResumeList";

export default function ResumeSection({
  resumes,
  totalCount,
  page,
  totalPages,
  onPageChange,
  onOpenDelete,
  onOpenReport,
}: {
  resumes: Resume[];
  totalCount: number;
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  onOpenDelete: (r: Resume) => void;
  onOpenReport: (r: Resume) => void;
}) {
  const hasAny = totalCount > 0;
  const router = useRouter();

  return (
    <div className="rounded-[20px] border border-[#9FA0A8]/30 bg-[#25262B] p-6 lg:p-8 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-semibold text-white">이력서 관리</div>
          <p className="mt-1 text-sm text-[#9FA0A8]">
            자신의 이력서를 관리하면 AI 리포트를 받아볼 수 있어요.
          </p>
        </div>

        <button
          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition-all shadow-xl shadow-blue-600/20 hover:bg-blue-500 active:scale-95"
          onClick={() => router.push("/ai-interview?pickResume=1")}
        >
          이력서 등록 +
        </button>
      </div>

      <div className="mt-6 border-t border-white/10 pt-5">
        <div className="text-sm font-semibold text-white">내 이력서</div>

        <div className="mt-4">
          {!hasAny ? (
            <ResumeEmpty />
          ) : (
            <ResumeList
              resumes={resumes}
              page={page}
              totalPages={totalPages}
              onPageChange={onPageChange}
              onOpenDelete={onOpenDelete}
              onOpenReport={onOpenReport}
            />
          )}
        </div>
      </div>
    </div>
  );
}
