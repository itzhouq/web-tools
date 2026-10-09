"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Wrench, Github } from "lucide-react";
import { site } from "@/lib/site";
import { TOOLS_HOME, isToolSubdomain } from "@/lib/subdomains";

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [onSub, setOnSub] = useState(false);
  useEffect(() => {
    setOnSub(isToolSubdomain(window.location.hostname));
  }, []);
  const homeHref = onSub ? TOOLS_HOME : "/";

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href={homeHref} className="flex items-center gap-2.5 group">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm transition-transform group-hover:scale-105">
            <Wrench className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-stone-800">
            {site.name}
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {isHome && !onSub ? (
            <a
              href="#tools"
              className="rounded-lg px-3 py-1.5 text-sm text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
            >
              全部工具
            </a>
          ) : (
            <Link
              href={homeHref + "#tools"}
              className="rounded-lg px-3 py-1.5 text-sm text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
            >
              全部工具
            </Link>
          )}
          <a
            href={site.mainSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg px-3 py-1.5 text-sm text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
          >
            博客
          </a>
          <a
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
            aria-label="GitHub"
          >
            <Github className="h-[18px] w-[18px]" />
          </a>
        </div>
      </div>
    </header>
  );
}
