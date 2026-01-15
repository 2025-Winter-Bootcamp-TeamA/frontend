"use client";

import { useMemo, useState } from "react";
import SideNav from "./SideNav";

import ResumeSection from "./resume/ResumeSection";
import AIReportModal from "./resume/AIReportModal";
import DeleteConfirmModal from "./resume/DeleteConfirmModal";
import SettingsSection from "./settings/SettingsSection";
import FavoritesSection from "./favorites/FavoritesSection";

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
    <div className="relative min-h-screen overflow-hidden bg-[#1A1B1E] text-white">
      {/* 배경 그라데이션(메인 Hero 느낌) */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[80%] w-[50%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[70%] w-[40%] rounded-full bg-purple-600/10 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <SideNav active={tab} onChange={setTab} />
          </aside>

          <main className="lg:col-span-9 min-w-0">
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

            {tab === "favorites" && <FavoritesSection />}

            {tab === "settings" && <SettingsSection />}
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
