"use client";

import type { Resume } from "../../_models/resume.types";
import ModalBase from "./ModalBase";

export default function AIReportModal({
  open,
  resume,
  onClose,
}: {
  open: boolean;
  resume: Resume | null;
  onClose: () => void;
}) {
  return (
    <ModalBase open={open} title="AI 분석 결과 통합 리포트" onClose={onClose}>
      <div className="text-xs text-zinc-400">
        대상: <span className="text-zinc-200">{resume?.title ?? "-"}</span>
      </div>

      <div className="mt-4 space-y-4">
        <section>
          <div className="mb-2 text-xs font-semibold text-zinc-200">분석내용</div>
          <div className="h-44 rounded-xl border border-zinc-800 bg-zinc-900/30" />
        </section>

        <section>
          <div className="mb-2 text-xs font-semibold text-zinc-200">예상 질문</div>
          <div className="h-44 rounded-xl border border-zinc-800 bg-zinc-900/30" />
        </section>
      </div>

      <div className="mt-6 flex items-center justify-center">
        <button
          className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400"
          onClick={() => alert("PDF 다운로드(목업)!")}
        >
          PDF 파일 다운로드
        </button>
      </div>
    </ModalBase>
  );
}
