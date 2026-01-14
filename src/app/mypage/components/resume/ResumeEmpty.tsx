"use client";

import { useRouter } from "next/navigation";

export default function ResumeEmpty() {
  const router = useRouter();

  return (
    <div className="relative rounded-2xl bg-zinc-900/30 p-10 text-center">
      <div className="mx-auto max-w-md">
        <p className="text-base font-semibold text-zinc-200">아직 이력서를 등록하지 않았어요</p>
        <p className="mt-2 text-sm text-zinc-400">AI 면접 기능에서 등록해보세요</p>

        <button
          className="mt-6 rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400"
          onClick={() => router.push("/ai-interview")}
        >
          AI 면접으로 이동
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-6 right-6 h-20 w-20 rounded-full bg-white/10" />
    </div>
  );
}
