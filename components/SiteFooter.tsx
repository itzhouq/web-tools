import { site } from "@/lib/site";

export function SiteFooter() {
  const links = [
    { label: "博客", href: site.mainSiteUrl },
    { label: "GitHub", href: site.github },
    { label: "开源仓库", href: `${site.github}/web-tools` },
  ];

  return (
    <footer className="mt-16 border-t border-stone-200/70 py-8">
      <div className="mx-auto max-w-5xl px-4 text-center text-[13px] leading-relaxed text-stone-500">
        <p>
          所有工具均在你的浏览器本地运行，数据不会上传到任何服务器。
        </p>
        <p className="mt-2 flex items-center justify-center gap-2">
          {links.map((l, i) => (
            <span key={l.href} className="flex items-center gap-2">
              {i > 0 && <span className="text-stone-300">·</span>}
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-500 underline decoration-stone-300 underline-offset-2 transition-colors hover:text-stone-900"
              >
                {l.label}
              </a>
            </span>
          ))}
        </p>
        <p className="mt-1">
          © {new Date().getFullYear()} {site.name} · 用心构建
        </p>
      </div>
    </footer>
  );
}
