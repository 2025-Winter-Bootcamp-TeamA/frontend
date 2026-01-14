"use client";

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

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-semibold">이력서 관리</div>
          <p className="mt-1 text-sm text-zinc-400">
            자신의 이력서를 관리하면 AI 리포트를 받아볼 수 있어요.
          </p>
        </div>

        <button
          className="rounded-xl bg-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-white"
          onClick={() => alert("이력서 등록 플로우는 다음 단계에서 연결!")}
        >
          이력서 등록 +
        </button>
      </div>

      <div className="mt-6 border-t border-zinc-800 pt-5">
        <div className="text-sm font-semibold text-zinc-200">내 이력서</div>

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
