"use client";

import type { Resume } from "../../_models/resume.types";
import ModalBase from "./ModalBase";

export default function DeleteConfirmModal({
  open,
  resume,
  onClose,
  onConfirm,
}: {
  open: boolean;
  resume: Resume | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalBase open={open} title="정말 삭제하실 건가요?" onClose={onClose}>
      <p className="text-sm text-[#9FA0A8]">
        {resume ? `“${resume.title}”` : "선택한 이력서"}를 삭제하면 복구할 수 없어요.
      </p>

      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          className="rounded-2xl bg-red-500 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-red-400 active:scale-95"
          onClick={onConfirm}
        >
          네, 삭제할게요
        </button>
        <button
          className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition-all hover:bg-white/10 active:scale-95"
          onClick={onClose}
        >
          아니요, 그냥 둘래요
        </button>
      </div>
    </ModalBase>
  );
}
