/** 全站使用次数统计：接入 Cloudflare Worker（web-tools-counter） */

export const COUNTER_URL = "https://web-tools-counter.itzhouq.workers.dev";

export type ToolStats = {
  ok: boolean;
  total: number;
  tools: Record<string, number>;
};

/** 记一次工具使用（失败静默，不影响工具本身） */
export async function hitTool(slug: string): Promise<void> {
  try {
    await fetch(`${COUNTER_URL}/api/hit`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tool: slug }),
      keepalive: true,
    });
  } catch {
    // 统计不可用时不打扰用户
  }
}

/** 拉全站各工具使用次数；失败返回 null */
export async function fetchStats(): Promise<ToolStats | null> {
  try {
    const r = await fetch(`${COUNTER_URL}/api/stats`);
    if (!r.ok) return null;
    return (await r.json()) as ToolStats;
  } catch {
    return null;
  }
}
