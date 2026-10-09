import { getTool } from "@/lib/tools";
import { ToolIcon } from "@/components/ToolIcon";
import { HomeBackLink } from "@/components/HomeBackLink";

/** 工具页统一头部与容器（服务端组件） */
export function ToolShell({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const tool = getTool(slug);
  if (!tool) return null;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <div className="mb-6">
        <HomeBackLink />
        <div className="flex items-center gap-4">
          <ToolIcon name={tool.icon} bg={tool.tint.bg} fg={tool.tint.fg} size={48} />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-stone-900">
              {tool.name}
            </h1>
            <p className="mt-0.5 text-sm text-stone-500">{tool.description}</p>
          </div>
        </div>
      </div>
      {children}
    </main>
  );
}
