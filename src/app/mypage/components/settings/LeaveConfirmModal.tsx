"use client";

import { signOut } from "next-auth/react";
import ModalBase from "../resume/ModalBase";

interface LeaveConfirmModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LeaveConfirmModal({ open, onClose }: LeaveConfirmModalProps) {
  const handleLeave = () => {
    // 회원탈퇴 후 홈으로 이동하면서 감사 모달을 띄우기 위한 쿼리 파라미터
    signOut({
      callbackUrl: "/?withdrawal=ok",
    });
  };

  return (
    <ModalBase open={open} onClose={onClose} title="DevRoad를 떠나시나요?">
      <div className="space-y-4 text-sm text-white">
        <p>
          탈퇴하시면 DevRoad에서 사용하신 계정 정보와 맞춤 추천 내역이 더 이상
          유지되지 않습니다.
        </p>
        <p className="text-xs text-[#9FA0A8]">
          추후 다시 로그인하면 새로운 계정처럼 처음부터 다시 시작하게 됩니다.
        </p>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-bold text-white transition-all hover:bg-white/10 active:scale-95"
        >
          아니요 잘못 선택했어요
        </button>
        <button
          type="button"
          onClick={handleLeave}
          className="rounded-2xl bg-red-500 px-5 py-3 text-xs font-bold text-white transition-all shadow-lg shadow-red-500/20 hover:bg-red-400 active:scale-95"
        >
          네 탈퇴할게요
        </button>
      </div>
    </ModalBase>
  );
}

