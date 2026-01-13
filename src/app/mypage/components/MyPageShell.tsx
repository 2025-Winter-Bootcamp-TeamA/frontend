"use client";

import { useMemo, useState } from "react";
import SideNav from "./SideNav";

import ResumeSection from "./resume/ResumeSection";
import AIReportModal from "./resume/AIReportModal";
import DeleteConfirmModal from "./resume/DeleteConfirmModal";

import type { Resume } from "../_models/resume.types";
import { mockResumes } from "../_models/resume.mock";

type TabKey = "resume" | "favorites" | "settings";

export default function MyPageShell() {
  const [tab, setTab] = useState<TabKey>("resume");

  // 목데이터(나중에 API로 교체만 하면 됨)
  const [resumes, setResumes] = useState<Resume[]>(mockResumes);

  // pagination (목업)
  const pageSize = 3;
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(resumes.length / pageSize));
  const pagedResumes = useMemo(() => {
    const start = (page - 1) * pageSize;
    return resumes.slice(start, start + pageSize);
  }, [resumes, page]);

  // modal states
  const [selected, setSelected] = useState<Resume | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const openDelete = (r: Resume) => {
    setSelected(r);
    setIsDeleteOpen(true);
  };

  const openReport = (r: Resume) => {
    setSelected(r);
    setIsReportOpen(true);
  };

  const closeDelete = () => {
    setIsDeleteOpen(false);
    setSelected(null);
  };

  const closeReport = () => {
    setIsReportOpen(false);
    setSelected(null);
  };

  const confirmDelete = () => {
    if (!selected) return;

    setResumes(prev => prev.filter(r => r.id !== selected.id));

    // 삭제 후 페이지가 비면 앞으로 이동
    setPage(prev => {
      const afterCount = resumes.length - 1;
      const afterPages = Math.max(1, Math.ceil(afterCount / pageSize));
      return Math.min(prev, afterPages);
    });

    closeDelete();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-12 gap-6">
          <aside className="col-span-3">
            <SideNav active={tab} onChange={setTab} />
          </aside>

          <main className="col-span-9">
            {tab === "resume" && (
              <ResumeSection
                resumes={pagedResumes}
                totalCount={resumes.length}
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                onOpenDelete={openDelete}
                onOpenReport={openReport}
              />
            )}

            {tab === "favorites" && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
                <div className="text-lg font-semibold">즐겨찾기 목록</div>
                <p className="mt-2 text-sm text-zinc-400">여기는 다음 단계에서 붙이면 돼.</p>
              </div>
            )}

            {tab === "settings" && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
                <div className="text-lg font-semibold">설정</div>
                <p className="mt-2 text-sm text-zinc-400">여기도 다음 단계에서.</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modals */}
      <DeleteConfirmModal
        open={isDeleteOpen}
        resume={selected}
        onClose={closeDelete}
        onConfirm={confirmDelete}
      />

      <AIReportModal open={isReportOpen} resume={selected} onClose={closeReport} />
    </div>
  );
}
