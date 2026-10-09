/** 封面绘制共享工具：wechat-cover 等封面类工具共用 */

export interface CoverTheme {
  name: string;
  bg: string;
  fg: string;
  sub: string;
  accent: string;
  accentText: string;
  /** 背景装饰圆颜色 */
  deco: string;
}

export const COVER_THEMES: CoverTheme[] = [
  { name: "奶油粉", bg: "#fdf2f4", fg: "#432d33", sub: "#a1808a", accent: "#e75a7c", accentText: "#ffffff", deco: "#fbdce3" },
  { name: "薄荷绿", bg: "#eefaf3", fg: "#0d3a2a", sub: "#6f9c8b", accent: "#10b981", accentText: "#ffffff", deco: "#d3f2e2" },
  { name: "云朵蓝", bg: "#eef4fd", fg: "#1e3350", sub: "#7d92b2", accent: "#3b82f6", accentText: "#ffffff", deco: "#d8e6fa" },
  { name: "暖阳黄", bg: "#fdf8ec", fg: "#4a3a12", sub: "#a8935e", accent: "#f59e0b", accentText: "#ffffff", deco: "#f7ecc9" },
  { name: "高级灰", bg: "#f4f4f5", fg: "#27272a", sub: "#8b8b93", accent: "#27272a", accentText: "#ffffff", deco: "#e4e4e7" },
  { name: "晚霞紫", bg: "#f5f1fd", fg: "#322659", sub: "#8d7fb5", accent: "#7c3aed", accentText: "#ffffff", deco: "#e5dbf8" },
  { name: "墨黑", bg: "#18181b", fg: "#fafafa", sub: "#a1a1aa", accent: "#22d3ee", accentText: "#083344", deco: "#27272a" },
  { name: "藏蓝", bg: "#0f172a", fg: "#f1f5f9", sub: "#94a3b8", accent: "#38bdf8", accentText: "#082f49", deco: "#1e293b" },
];

/** 逐字符换行（中文友好） */
export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const para of text.split("\n")) {
    if (!para) continue;
    let line = "";
    for (const ch of para) {
      if (ctx.measureText(line + ch).width > maxWidth && line) {
        lines.push(line);
        line = ch;
      } else {
        line += ch;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

/** 自动缩小字号直到放得下 */
export function fitLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
  startSize: number,
  weight: string
): { lines: string[]; size: number } {
  let size = startSize;
  for (;;) {
    ctx.font = `${weight} ${size}px sans-serif`;
    const lines = wrapText(ctx, text, maxWidth);
    if (lines.length <= maxLines || size <= 32) {
      return { lines: lines.slice(0, maxLines), size };
    }
    size -= 4;
  }
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** 画顶部标签胶囊，返回底部 y 坐标 */
export function drawTag(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  t: CoverTheme,
  fontSize = 26
): number {
  ctx.font = `600 ${fontSize}px sans-serif`;
  const w = ctx.measureText(text).width + fontSize * 1.7;
  const h = fontSize * 2;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = t.accent;
  ctx.fill();
  ctx.fillStyle = t.accentText;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + fontSize * 0.85, y + h / 2 + 1);
  return y + h;
}
