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
      <p className="text-sm text-zinc-400">
        {resume ? `“${resume.title}”` : "선택한 이력서"}를 삭제하면 복구할 수 없어요.
      </p>

      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400"
          onClick={onConfirm}
        >
          네, 삭제할게요
        </button>
        <button
          className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
          onClick={onClose}
        >
          아니요, 그냥 둘래요
        </button>
      </div>
    </ModalBase>
  );
}
