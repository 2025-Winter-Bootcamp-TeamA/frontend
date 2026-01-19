"use client";

// 탭 타입 정의 (MyPageShell과 동일하게 맞춤)
type TabKey = "resume" | "favorites" | "settings";

interface SideNavProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

export default function SideNav({ active, onChange }: SideNavProps) {
  // 개별 메뉴 아이템 컴포넌트
  const NavItem = ({ id, label }: { id: TabKey; label: string }) => (
    <button
      onClick={() => onChange(id)}
      className={[
        "w-full rounded-xl px-4 py-3 text-left text-sm transition-all duration-200",
        active === id
          ? "bg-white/10 text-white font-bold shadow-sm" // 활성화 상태
          : "bg-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-100", // 비활성화 상태
      ].join(" ")}
    >
      {label}
    </button>
  );

  return (
    <nav className="h-fit rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="space-y-2">
        <NavItem id="resume" label="이력서 관리" />
        <NavItem id="favorites" label="즐겨찾기 목록" />
        <NavItem id="settings" label="설정" />
      </div>
    </nav>
  );
}