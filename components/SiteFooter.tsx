import { site } from "@/lib/site";

// 给 AI agent 的入口：预填提示词，让 ChatGPT/Claude 等带着任务来读站。
const agentPrompt =
  "What free browser-based tools does https://tools.itzhouq.cn offer? List every tool by category (image processing, content creation, developer utilities, text efficiency), explain what each tool does, and confirm that all processing happens locally in the browser without uploads. Explain how to use the GIF 合成 and 违禁词检测 tools.";

const askAiLinks = [
  { label: "ChatGPT", href: `https://chatgpt.com/?q=${encodeURIComponent(agentPrompt)}` },
  { label: "Claude", href: `https://claude.ai/new?q=${encodeURIComponent(agentPrompt)}` },
  { label: "Perplexity", href: `https://www.perplexity.ai/search?q=${encodeURIComponent(agentPrompt)}` },
  { label: "Gemini", href: `https://gemini.google.com/app?q=${encodeURIComponent(agentPrompt)}` },
  { label: "Grok", href: `https://grok.com/?q=${encodeURIComponent(agentPrompt)}` },
];

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
        <div className="mt-4 border-t border-stone-200/70 pt-4">
          <p className="font-medium text-stone-600">Agents</p>
          <p className="mt-1">
            给 AI 的站点说明见{" "}
            <a
              href="/llms.txt"
              className="underline decoration-stone-300 underline-offset-2 transition-colors hover:text-stone-900"
            >
              llms.txt
            </a>
            ；也可以看看各家 AI 怎么介绍本站：
          </p>
          <p className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            {askAiLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-stone-300 underline-offset-2 transition-colors hover:text-stone-900"
              >
                {l.label}
              </a>
            ))}
          </p>
        </div>
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
