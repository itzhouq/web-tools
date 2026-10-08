"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { CATEGORY_META, TOOLS, type ToolCategory } from "@/lib/tools";
import { ToolIcon } from "@/components/ToolIcon";

type Filter = ToolCategory | "all";

export function ToolExplorer() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(() => {
    const map = new Map<Filter, number>([["all", TOOLS.length]]);
    for (const t of TOOLS) {
      map.set(t.category, (map.get(t.category) ?? 0) + 1);
    }
    return map;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOOLS.filter((t) => {
      if (filter !== "all" && t.category !== filter) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [query, filter]);

  // 按分类分组展示
  const grouped = useMemo(() => {
    const groups: { category: ToolCategory; tools: typeof TOOLS }[] = [];
    for (const t of filtered) {
      let g = groups.find((x) => x.category === t.category);
      if (!g) {
        g = { category: t.category, tools: [] };
        groups.push(g);
      }
      g.tools.push(t);
    }
    return groups;
  }, [filtered]);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4">
      {/* Hero */}
      <section className="pt-14 pb-10 text-center sm:pt-20">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          小工具，解决日常小麻烦。
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-stone-500">
          压缩图片、生成封面、检查文案、处理数据 ——
          全部在浏览器本地完成，不上传任何数据。
        </p>
        <div className="relative mx-auto mt-8 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索工具、用途或关键词…"
            className="w-full rounded-xl border border-stone-300 bg-white py-3 pl-10 pr-4 text-sm text-stone-800 shadow-sm transition-all placeholder:text-stone-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>
      </section>

      {/* 分类过滤 */}
      <section
        id="tools"
        className="flex flex-wrap items-center gap-2 scroll-mt-20 pb-6"
      >
        <FilterChip
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label="全部"
          count={counts.get("all") ?? 0}
        />
        {(Object.keys(CATEGORY_META) as ToolCategory[]).map((c) => (
          <FilterChip
            key={c}
            active={filter === c}
            onClick={() => setFilter(c)}
            label={CATEGORY_META[c].label}
            count={counts.get(c) ?? 0}
          />
        ))}
      </section>

      {/* 工具网格 */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100 text-stone-400">
            <Search className="h-5 w-5" />
          </span>
          <p className="text-sm text-stone-500">
            没有找到「{query}」相关的工具
          </p>
          <button
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
            className="mt-3 text-sm text-indigo-600 hover:underline"
          >
            清除搜索条件
          </button>
        </div>
      ) : (
        <div className="space-y-10 pb-4">
          {grouped.map((group) => (
            <div key={group.category}>
              <div className="mb-4 flex items-center gap-2">
                <h2 className="text-[15px] font-semibold text-stone-800">
                  {CATEGORY_META[group.category].label}
                </h2>
                <span className="text-xs text-stone-400">
                  {group.tools.length} 个工具
                </span>
                <span className="ml-1 h-px flex-1 bg-stone-200/80" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.tools.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all ${
        active
          ? "bg-stone-900 text-white shadow-sm"
          : "bg-white text-stone-600 border border-stone-200 hover:border-stone-300 hover:bg-stone-50"
      }`}
    >
      {label}
      <span
        className={`ml-1.5 tabular-nums ${active ? "text-stone-400" : "text-stone-400"}`}
      >
        {count}
      </span>
    </button>
  );
}

function ToolCard({ tool }: { tool: (typeof TOOLS)[number] }) {
  return (
    <Link
      href={`/tools/${tool.slug}/`}
      className="group relative flex flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between">
        <ToolIcon name={tool.icon} bg={tool.tint.bg} fg={tool.tint.fg} />
        {tool.isNew && (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600 ring-1 ring-amber-200">
            <Sparkles className="h-3 w-3" />
            NEW
          </span>
        )}
      </div>
      <h3 className="text-[15px] font-semibold text-stone-800 group-hover:text-indigo-700">
        {tool.name}
      </h3>
      <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-stone-500">
        {tool.description}
      </p>
    </Link>
  );
}
