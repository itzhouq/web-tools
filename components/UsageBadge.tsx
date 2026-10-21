"use client";

import { useEffect, useState } from "react";
import { fetchStats, hitTool } from "@/lib/usage";

/** 工具页挂载即记一次使用，并显示全站累计次数 */
export function UsageBadge({ slug }: { slug: string }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    hitTool(slug);
    fetchStats().then((s) => {
      const c = s?.tools[slug];
      if (typeof c === "number") setCount(c);
    });
  }, [slug]);

  if (count === null) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-[12px] text-stone-500 tabular-nums">
      已被使用 {count} 次
    </span>
  );
}
