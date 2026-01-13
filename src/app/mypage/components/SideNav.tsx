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
        "w-full rounded-xl px-4 py-3 text-left text-sm transition",
        active === id
          ? "bg-zinc-800 text-zinc-100"
          : "bg-transparent text-zinc-300 hover:bg-zinc-900/60 hover:text-zinc-100",
      ].join(" ")}
    >
      {label}
    </button>
  );

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="space-y-2">
        <Item id="resume" label="이력서 관리" />
        <Item id="favorites" label="즐겨찾기 목록" />
        <Item id="settings" label="설정" />
      </div>
    </div>
  );
}
