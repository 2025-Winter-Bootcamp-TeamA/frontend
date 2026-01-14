"use client";

import { useState } from "react";
import LeaveConfirmModal from "./LeaveConfirmModal";

export default function SettingsSection() {
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 lg:p-8">
      <h2 className="text-lg font-semibold text-zinc-50">설정</h2>

      <div className="mt-8 space-y-8">
        {/* 회원탈퇴 영역 */}
        <section className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-200">회원탈퇴</p>
            <p className="mt-1 text-xs text-zinc-500">
              DevRoad 계정을 삭제하고 서비스를 더 이상 이용하지 않습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsLeaveOpen(true)}
            className="text-sm font-semibold text-red-500 hover:text-red-400 transition-colors"
          >
            회원탈퇴
          </button>
        </section>
      </div>

      <LeaveConfirmModal
        open={isLeaveOpen}
        onClose={() => setIsLeaveOpen(false)}
      />
    </div>
  );
}
