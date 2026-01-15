"use client";

import type { Resume } from "../../_models/resume.types";
import { Trash2 } from "lucide-react";

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
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#9FA0A8]/30 bg-[#1A1B1E]/30 p-4 transition-all hover:border-[#9FA0A8] hover:bg-[#2C2D33]">
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-white">{resume.title}</div>
        <div className="mt-1 text-xs text-[#9FA0A8]">
          {resume.company ? `${resume.company} · ` : ""}
          등록일: {resume.createdAt}
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {resume.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-[#9FA0A8]"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          className="rounded-2xl bg-blue-600 px-4 py-3 text-xs font-bold text-white transition-all shadow-lg shadow-blue-600/20 hover:bg-blue-500 active:scale-95"
          onClick={onReport}
        >
          AI 통합 리포트
        </button>

        <button
          className="rounded-2xl border border-white/10 bg-white/5 p-3 text-red-300 transition-all hover:bg-red-500/10 hover:text-red-200 active:scale-95"
          onClick={onDelete}
          aria-label="이력서 삭제"
          title="삭제"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
