"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  mockFavoriteCompanies,
} from "../../_models/favorites.mock";
import { useFavoritesStore } from "@/store/favoritesStore";
import type {
  FavoriteCompany,
  FavoriteTechStack,
  TechCategory,
} from "../../_models/favorites.types";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

type FavoritesTab = "tech" | "company";
type TechFilter = "all" | TechCategory;

const TECH_CATEGORY_LABEL: Record<TechFilter, string> = {
  all: "전체",
  frontend: "Frontend",
  backend: "Backend",
  "ai-data": "AI / Data",
  mobile: "Mobile",
  devops: "DevOps",
  etc: "기타",
};

const TECH_PAGE_SIZE = 6;
const COMPANY_PAGE_SIZE = 4;

const TECH_CATEGORY_COLOR: Record<TechFilter, string> = {
  all: "#94A3B8",
  frontend: "#277FA9",
  backend: "#4CAF50",
  "ai-data": "#9C27B0",
  mobile: "#60A5FA",
  devops: "#FF9800",
  etc: "#94A3B8",
};

const TECH_CATEGORY_UPPER: Record<TechCategory, string> = {
  frontend: "Frontend",
  backend: "Backend",
  "ai-data": "AI / Data",
  mobile: "Mobile",
  devops: "DevOps",
  etc: "기타",
};

function hashToInt(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function getMiniReport(tech: FavoriteTechStack) {
  const seed = hashToInt(tech.id);
  const share = 18 + (seed % 63); // 18~80
  const growth = -8 + (seed % 29); // -8~20
  const mentions = 1200 + (seed % 9800);
  const timeline = Array.from({ length: 6 }, (_, i) => {
    const v = (seed * (i + 3) * 13) % 100;
    return 25 + (v % 70); // 25~94
  });
  return { share, growth, mentions, timeline };
}

function FilterDropdown({
  value,
  onChange,
}: {
  value: TechFilter;
  onChange: (v: TechFilter) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLabel = TECH_CATEGORY_LABEL[value];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-2 bg-black/40 border border-white/10 hover:border-white/20 transition-all px-4 py-2 rounded-2xl text-sm font-bold text-white/80"
      >
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: TECH_CATEGORY_COLOR[value] }}
          />
          {currentLabel}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className="text-white/40" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 6, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 z-50 min-w-[160px] bg-[#2A2B30] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
          >
            {Object.entries(TECH_CATEGORY_LABEL).map(([key, label]) => {
              const k = key as TechFilter;
              const active = k === value;
              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(k);
                      setIsOpen(false);
                    }}
                    className={[
                      "w-full text-left px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2",
                      active
                        ? "bg-blue-600 text-white"
                        : "text-white/70 hover:bg-white/5 hover:text-white",
                    ].join(" ")}
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: TECH_CATEGORY_COLOR[k] }}
                    />
                    {label}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FavoritesSection() {
  const [tab, setTab] = useState<FavoritesTab>("tech");

  const [techFilter, setTechFilter] = useState<TechFilter>("all");
  const [techPage, setTechPage] = useState(1);
  const [companyPage, setCompanyPage] = useState(1);
  const [hoveredTechId, setHoveredTechId] = useState<string | null>(null);

  // 즐겨찾기 store에서 읽어오기
  const { techStacks, toggleTechStack } = useFavoritesStore();
  const techFavorites = techStacks;
  
  const [companyFavorites, setCompanyFavorites] =
    useState<FavoriteCompany[]>(mockFavoriteCompanies);

  const filteredTech = useMemo(() => {
    let list = techFavorites.filter((t) => t.isFavorite);
    if (techFilter !== "all") {
      list = list.filter((t) => t.category === techFilter);
    }
    // 등록순(최근 추가 순) 기준 내림차순
    return [...list].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [techFavorites, techFilter]);

  const pagedTech = useMemo(() => {
    const start = (techPage - 1) * TECH_PAGE_SIZE;
    return filteredTech.slice(start, start + TECH_PAGE_SIZE);
  }, [filteredTech, techPage]);

  const techTotalPages = Math.max(
    1,
    Math.ceil(filteredTech.length / TECH_PAGE_SIZE),
  );

  const favoriteCompanies = useMemo(
    () => companyFavorites.filter((c) => c.isFavorite),
    [companyFavorites],
  );

  const pagedCompanies = useMemo(() => {
    const start = (companyPage - 1) * COMPANY_PAGE_SIZE;
    return favoriteCompanies.slice(start, start + COMPANY_PAGE_SIZE);
  }, [favoriteCompanies, companyPage]);

  const companyTotalPages = Math.max(
    1,
    Math.ceil(favoriteCompanies.length / COMPANY_PAGE_SIZE),
  );

  const handleToggleTechFavorite = (tech: FavoriteTechStack) => {
    toggleTechStack(tech);
  };

  const handleToggleCompanyFavorite = (id: string) => {
    setCompanyFavorites((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, isFavorite: !c.isFavorite } : c,
      ),
    );
  };

  const renderEmpty = (label: string) => (
    <div className="flex h-[340px] flex-col items-center justify-center rounded-2xl bg-zinc-900/40 text-center text-sm text-zinc-400">
      <div className="mb-4 rounded-xl bg-zinc-800 px-6 py-4 text-zinc-200">
        그림
      </div>
      <p className="text-xs">{label}</p>
    </div>
  );

  const Pagination = ({
    page,
    totalPages,
    onChange,
  }: {
    page: number;
    totalPages: number;
    onChange: (p: number) => void;
  }) => {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
      <div className="mt-6 flex justify-center gap-2 text-xs text-zinc-400">
        <button
          type="button"
          className="rounded-md px-2 py-1 hover:bg-zinc-800 disabled:opacity-40"
          disabled={page === 1}
          onClick={() => onChange(Math.max(1, page - 1))}
        >
          {"<"}
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={[
              "min-w-[28px] rounded-md px-2 py-1",
              p === page
                ? "bg-zinc-100 text-zinc-900"
                : "bg-transparent text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100",
            ].join(" ")}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          className="rounded-md px-2 py-1 hover:bg-zinc-800 disabled:opacity-40"
          disabled={page === totalPages}
          onClick={() => onChange(Math.min(totalPages, page + 1))}
        >
          {">"}
        </button>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 lg:p-8">
      <header className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-50">즐겨찾기 목록</h2>
      </header>

      {/* 상단 탭: 기술 스택 / 기업 */}
      <div className="mb-4 flex items-center gap-6 border-b border-zinc-800 pb-2 text-sm">
        <button
          type="button"
          onClick={() => setTab("tech")}
          className={[
            "pb-2",
            tab === "tech"
              ? "border-b-2 border-zinc-100 text-zinc-50"
              : "text-zinc-400 hover:text-zinc-100",
          ].join(" ")}
        >
          기술 스택
        </button>
        <span className="text-zinc-600">·</span>
        <button
          type="button"
          onClick={() => setTab("company")}
          className={[
            "pb-2",
            tab === "company"
              ? "border-b-2 border-zinc-100 text-zinc-50"
              : "text-zinc-400 hover:text-zinc-100",
          ].join(" ")}
        >
          기업
        </button>
      </div>

      {tab === "tech" ? (
        <section>
          {/* 필터 & 분류 드롭다운 */}
          <div className="mb-4 flex items-center justify-between text-xs text-zinc-400">
            <span>총 {filteredTech.length}개</span>
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  className="w-32 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 outline-none hover:border-zinc-500"
                  value={techFilter}
                  onChange={(e) => {
                    setTechPage(1);
                    setTechFilter(e.target.value as TechFilter);
                  }}
                >
                  {Object.entries(TECH_CATEGORY_LABEL).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-zinc-500">분류 · 등록순</span>
            </div>
          </div>

          {filteredTech.length === 0 ? (
            renderEmpty("아직 아무것도 없네요!")
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {pagedTech.map((tech) => (
                  <article
                    key={tech.id}
                    className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-zinc-900">
                        <img
                          src={tech.logoUrl}
                          alt={tech.name}
                          className="h-8 w-8 object-contain"
                        />
                      </div>
                      <div>
                        <p className="text-xs uppercase text-zinc-500">
                          {tech.category === "frontend"
                            ? "Frontend"
                            : tech.category === "backend"
                              ? "Backend"
                              : tech.category === "ai-data"
                                ? "AI / Data"
                                : tech.category === "mobile"
                                  ? "Mobile"
                                  : tech.category === "devops"
                                    ? "DevOps"
                                    : "기타"}
                        </p>
                        <p className="text-sm font-semibold text-zinc-50">
                          {tech.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <a
                        href={tech.docsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-zinc-800 px-3 py-1 text-[11px] font-medium text-zinc-100 hover:bg-zinc-700"
                      >
                        공식 문서
                      </a>
                      <button
                        type="button"
                        onClick={() => handleToggleTechFavorite(tech)}
                        className="text-yellow-400 hover:text-zinc-500"
                        aria-label="즐겨찾기 해제"
                      >
                        ★
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              <Pagination
                page={techPage}
                totalPages={techTotalPages}
                onChange={setTechPage}
              />
            </>
          )}
        </section>
      ) : (
        <section>
          <div className="mb-4 text-xs text-zinc-400">
            총 {favoriteCompanies.length}개
          </div>
          {favoriteCompanies.length === 0 ? (
            renderEmpty("아직 아무것도 없네요!")
          ) : (
            <>
              <div className="space-y-3">
                {pagedCompanies.map((company) => (
                  <article
                    key={company.id}
                    className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-zinc-900">
                        <img
                          src={company.logoUrl}
                          alt={company.name}
                          className="h-8 w-8 object-contain"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-50">
                          {company.name}
                        </p>
                        <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
                          {company.description}
                        </p>
                        <p className="mt-1 text-[11px] text-zinc-500">
                          기술 스택: {company.techStacks.join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <a
                        href={company.siteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-zinc-800 px-3 py-1 text-[11px] font-medium text-zinc-100 hover:bg-zinc-700"
                      >
                        채용 사이트
                      </a>
                      <button
                        type="button"
                        onClick={() => handleToggleCompanyFavorite(company.id)}
                        className="text-yellow-400 hover:text-zinc-500"
                        aria-label="즐겨찾기 해제"
                      >
                        ★
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              <Pagination
                page={companyPage}
                totalPages={companyTotalPages}
                onChange={setCompanyPage}
              />
            </>
          )}
        </section>
      )}
    </div>
  );
}

