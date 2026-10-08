"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Shuffle } from "lucide-react";
import { Button, Field, Panel, downloadBlob, inputCls } from "@/components/ui";

interface CoverTheme {
  name: string;
  bg: string;
  fg: string;
  sub: string;
  accent: string;
  accentText: string;
  /** 背景装饰圆颜色 */
  deco: string;
}

const THEMES: CoverTheme[] = [
  { name: "奶油粉", bg: "#fdf2f4", fg: "#432d33", sub: "#a1808a", accent: "#e75a7c", accentText: "#ffffff", deco: "#fbdce3" },
  { name: "薄荷绿", bg: "#eefaf3", fg: "#0d3a2a", sub: "#6f9c8b", accent: "#10b981", accentText: "#ffffff", deco: "#d3f2e2" },
  { name: "云朵蓝", bg: "#eef4fd", fg: "#1e3350", sub: "#7d92b2", accent: "#3b82f6", accentText: "#ffffff", deco: "#d8e6fa" },
  { name: "暖阳黄", bg: "#fdf8ec", fg: "#4a3a12", sub: "#a8935e", accent: "#f59e0b", accentText: "#ffffff", deco: "#f7ecc9" },
  { name: "高级灰", bg: "#f4f4f5", fg: "#27272a", sub: "#8b8b93", accent: "#27272a", accentText: "#ffffff", deco: "#e4e4e7" },
  { name: "晚霞紫", bg: "#f5f1fd", fg: "#322659", sub: "#8d7fb5", accent: "#7c3aed", accentText: "#ffffff", deco: "#e5dbf8" },
];

const W = 1080;
const H = 1440;

/** 逐字符换行（中文友好） */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
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
function fitLines(
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

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function XhsCover() {
  const [title, setTitle] = useState("写给你的\n效率工具指南");
  const [subtitle, setSubtitle] = useState("从图片压缩到违禁词检测");
  const [tag, setTag] = useState("效率提升");
  const [themeIdx, setThemeIdx] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const t = THEMES[themeIdx];
    const ctx = canvas.getContext("2d")!;
    const scale = 2;
    canvas.width = W * scale;
    canvas.height = H * scale;
    ctx.scale(scale, scale);

    // 背景
    ctx.fillStyle = t.bg;
    ctx.fillRect(0, 0, W, H);

    // 装饰圆
    ctx.fillStyle = t.deco;
    ctx.beginPath();
    ctx.arc(W - 120, 150, 260, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(60, H - 180, 200, 0, Math.PI * 2);
    ctx.fill();

    // 标签
    if (tag.trim()) {
      ctx.font = "600 40px sans-serif";
      const tagW = ctx.measureText(tag.trim()).width + 72;
      roundRect(ctx, 96, 150, tagW, 84, 42);
      ctx.fillStyle = t.accent;
      ctx.fill();
      ctx.fillStyle = t.accentText;
      ctx.textBaseline = "middle";
      ctx.fillText(tag.trim(), 96 + 36, 150 + 44);
    }

    // 主标题（最多 4 行，自动缩放）
    const { lines, size } = fitLines(ctx, title.trim() || "标题", W - 220, 4, 130, "700");
    ctx.textBaseline = "top";
    let y = 430;
    ctx.fillStyle = t.fg;
    ctx.font = `700 ${size}px sans-serif`;
    const lh = size * 1.32;
    for (const line of lines) {
      ctx.fillText(line, 108, y);
      y += lh;
    }

    // 标题下划线块
    ctx.fillStyle = t.accent;
    roundRect(ctx, 108, y + 10, 120, 14, 7);
    ctx.fill();

    // 副标题
    if (subtitle.trim()) {
      const sub = fitLines(ctx, subtitle.trim(), W - 260, 2, 52, "400");
      ctx.fillStyle = t.sub;
      ctx.font = `400 ${sub.size}px sans-serif`;
      let sy = y + 90;
      for (const line of sub.lines) {
        ctx.fillText(line, 108, sy);
        sy += sub.size * 1.5;
      }
    }

    // 底部品牌条
    ctx.fillStyle = t.fg;
    ctx.globalAlpha = 0.75;
    ctx.font = "500 34px sans-serif";
    ctx.fillText("小工具集 · 让创作更轻松", 108, H - 120);
    ctx.globalAlpha = 1;
    ctx.fillStyle = t.accent;
    roundRect(ctx, 108, H - 170, 44, 8, 4);
    ctx.fill();
  }, [title, subtitle, tag, themeIdx]);

  useEffect(() => {
    render();
  }, [render]);

  return (
    <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
      <div className="space-y-4">
        <Panel title="封面内容">
          <div className="space-y-4">
            <Field label="主标题（换行可控制断句，最多 4 行）">
              <textarea
                className={`${inputCls} min-h-[96px] resize-y leading-relaxed`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Field>
            <Field label="副标题（可选）">
              <input
                className={inputCls}
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </Field>
            <Field label="顶部标签（可选）">
              <input
                className={inputCls}
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="如：效率提升 / 干货分享"
              />
            </Field>
          </div>
        </Panel>

        <Panel title="配色模板">
          <div className="grid grid-cols-3 gap-2.5">
            {THEMES.map((t, i) => (
              <button
                key={t.name}
                onClick={() => setThemeIdx(i)}
                className={`rounded-xl border-2 p-2.5 text-left transition-all ${
                  themeIdx === i
                    ? "border-indigo-500 bg-indigo-50/50"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <div className="mb-1.5 flex gap-1">
                  <span className="h-5 w-5 rounded-full border border-black/5" style={{ background: t.bg }} />
                  <span className="h-5 w-5 rounded-full border border-black/5" style={{ background: t.accent }} />
                  <span className="h-5 w-5 rounded-full border border-black/5" style={{ background: t.fg }} />
                </div>
                <span className="text-xs font-medium text-stone-600">{t.name}</span>
              </button>
            ))}
          </div>
          <Button
            variant="secondary"
            className="mt-4 w-full"
            onClick={() => setThemeIdx((i) => (i + Math.floor(Math.random() * 5) + 1) % THEMES.length)}
          >
            <Shuffle className="h-4 w-4" />
            随机换一个配色
          </Button>
        </Panel>

        <Button
          className="w-full"
          onClick={() =>
            canvasRef.current?.toBlob(
              (b) => b && downloadBlob(b, `小红书封面-${THEMES[themeIdx].name}.png`),
              "image/png"
            )
          }
        >
          <Download className="h-4 w-4" />
          下载封面（1080×1440 · 2x 高清）
        </Button>
      </div>

      <Panel title="实时预览（3:4）">
        <div className="mx-auto max-w-[420px] overflow-hidden rounded-xl shadow-md ring-1 ring-black/5">
          <canvas ref={canvasRef} className="block h-auto w-full" />
        </div>
      </Panel>
    </div>
  );
}
