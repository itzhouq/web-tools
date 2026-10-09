"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { TOOLS_HOME, isToolSubdomain } from "@/lib/subdomains";

/** "返回工具列表"链接：在工具子域名下指向 tools.itzhouq.cn */
export function HomeBackLink() {
  const [onSub, setOnSub] = useState(false);
  useEffect(() => {
    setOnSub(isToolSubdomain(window.location.hostname));
  }, []);
  const href = onSub ? `${TOOLS_HOME}/#tools` : "/#tools";

  return (
    <Link
      href={href}
      className="mb-5 inline-flex items-center gap-1.5 text-[13px] text-stone-500 transition-colors hover:text-stone-900"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      返回工具列表
    </Link>
  );
}
