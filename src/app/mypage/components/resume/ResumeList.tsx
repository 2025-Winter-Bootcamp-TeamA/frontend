"use client";

import type { Resume } from "../../_models/resume.types";
import ResumeCard from "./ResumeCard";

export default function ResumeList({
  resumes,
  page,
  totalPages,
  onPageChange,
  onOpenDelete,
  onOpenReport,
}: {
  resumes: Resume[];
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  onOpenDelete: (r: Resume) => void;
  onOpenReport: (r: Resume) => void;
}) {
  return (
    <div>
      <div className="space-y-3">
        {resumes.map((r) => (
          <ResumeCard
            key={r.id}
            resume={r}
            onDelete={() => onOpenDelete(r)}
            onReport={() => onOpenReport(r)}
          />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-zinc-300">
        <button
          className="rounded-lg px-2 py-1 hover:bg-zinc-800 disabled:opacity-40"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          &lt;
        </button>

        {Array.from({ length: totalPages }).map((_, idx) => {
          const p = idx + 1;
          const active = p === page;
          return (
            <button
              key={p}
              className={[
                "rounded-lg px-3 py-1",
                active ? "bg-zinc-200 text-zinc-900" : "hover:bg-zinc-800",
              ].join(" ")}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          );
        })}

        <button
          className="rounded-lg px-2 py-1 hover:bg-zinc-800 disabled:opacity-40"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
        >
          &gt;
        </button>
      </div>
    </div>
  );
}
