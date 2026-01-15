"use client";

type TabKey = "resume" | "favorites" | "settings";

export default function SideNav({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
}) {
  const Item = ({ id, label }: { id: TabKey; label: string }) => (
    <button
      onClick={() => onChange(id)}
      className={[
        "w-full rounded-xl px-4 py-3 text-left text-sm transition-all",
        active === id
          ? "bg-white/10 text-white"
          : "bg-transparent text-[#9FA0A8] hover:bg-white/5 hover:text-white",
      ].join(" ")}
    >
      {label}
    </button>
  );

  return (
    <div className="rounded-[20px] border border-[#9FA0A8]/30 bg-[#25262B] p-4 shadow-sm">
      <div className="space-y-2">
        <Item id="resume" label="이력서 관리" />
        <Item id="favorites" label="즐겨찾기 목록" />
        <Item id="settings" label="설정" />
      </div>
    </div>
  );
}
