"use client";

import { useState } from "react";
import LeaveConfirmModal from "./LeaveConfirmModal";

export default function SettingsSection() {
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);

  return (
    <div className="rounded-[20px] border border-[#9FA0A8]/30 bg-[#25262B] p-6 lg:p-8 shadow-sm">
      <h2 className="text-lg font-semibold text-white">설정</h2>

      <div className="mt-8 space-y-8">
        {/* 회원탈퇴 영역 */}
        <section className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">회원탈퇴</p>
            <p className="mt-1 text-xs text-[#9FA0A8]">
              DevRoad 계정을 삭제하고 서비스를 더 이상 이용하지 않습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsLeaveOpen(true)}
            className="text-sm font-bold text-red-400 hover:text-red-300 transition-colors"
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
