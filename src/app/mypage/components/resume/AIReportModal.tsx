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
      <div className="text-xs text-[#9FA0A8]">
        대상: <span className="text-white">{resume?.title ?? "-"}</span>
      </div>

      <div className="mt-4 space-y-4">
        <section>
          <div className="mb-2 text-xs font-semibold text-white">분석내용</div>
          <div className="h-44 rounded-2xl border border-white/10 bg-white/5" />
        </section>

        <section>
          <div className="mb-2 text-xs font-semibold text-white">예상 질문</div>
          <div className="h-44 rounded-2xl border border-white/10 bg-white/5" />
        </section>
      </div>

      <div className="mt-6 flex items-center justify-center">
        <button
          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition-all shadow-lg shadow-blue-600/20 hover:bg-blue-500 active:scale-95"
          onClick={() => alert("PDF 다운로드(목업)!")}
        >
          PDF 파일 다운로드
        </button>
      </div>
    </ModalBase>
  );
}
