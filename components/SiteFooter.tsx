import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-stone-200/70 py-8">
      <div className="mx-auto max-w-5xl px-4 text-center text-[13px] leading-relaxed text-stone-500">
        <p>
          所有工具均在你的浏览器本地运行，数据不会上传到任何服务器。
        </p>
        <p className="mt-1">
          © {new Date().getFullYear()} {site.name} · 由{" "}
          <a
            href={site.mainSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-600 underline decoration-stone-300 underline-offset-2 transition-colors hover:text-stone-900"
          >
            {site.author}
          </a>{" "}
          用心构建
        </p>
      </div>
    </footer>
  );
}
