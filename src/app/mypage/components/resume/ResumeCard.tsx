"use client";

import type { Resume } from "../../_models/resume.types";

export default function ResumeCard({
  resume,
  onReport,
  onDelete,
}: {
  resume: Resume;
  onReport: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-zinc-100">{resume.title}</div>
        <div className="mt-1 text-xs text-zinc-400">
          {resume.company ? `${resume.company} · ` : ""}
          등록일: {resume.createdAt}
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {resume.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-zinc-700 bg-zinc-900/40 px-2 py-0.5 text-[11px] text-zinc-300"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          className="rounded-xl bg-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-900 hover:bg-white"
          onClick={onReport}
        >
          AI 통합 리포트
        </button>

        <button
          className="rounded-xl border border-zinc-700 px-3 py-2 text-xs text-red-300 hover:bg-red-500/10 hover:text-red-200"
          onClick={onDelete}
          aria-label="이력서 삭제"
          title="삭제"
        >
          
        </button>
      </div>
    </div>
  );
}
