"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Shuffle } from "lucide-react";
import { Button, Field, Panel, downloadBlob, inputCls } from "@/components/ui";
import {
  COVER_THEMES,
  drawTag,
  fitLines,
  roundRect,
  type CoverTheme,
} from "@/lib/cover-utils";

/** 平台尺寸预设 */
const SIZES = [
  { key: "wechat-head", label: "公众号首图", w: 900, h: 383, ratio: "2.35:1" },
  { key: "wechat-sub", label: "公众号次图", w: 800, h: 800, ratio: "1:1" },
  { key: "xhs", label: "小红书封面", w: 1080, h: 1440, ratio: "3:4" },
] as const;

type SizeKey = (typeof SIZES)[number]["key"];

export function WechatCover() {
  const [sizeKey, setSizeKey] = useState<SizeKey>("wechat-head");
  const [title, setTitle] = useState("用 MCP 让 AI 读你的微信群消息");
  const [subtitle, setSubtitle] = useState("本地解密 + AI 总结全流程");
  const [tag, setTag] = useState("AI 实战");
  const [author, setAuthor] = useState("搞副业的老周itzhouq");
  const [filename, setFilename] = useState("hello-build-in-public");
  const [themeIdx, setThemeIdx] = useState(2);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const size = SIZES.find((s) => s.key === sizeKey)!;

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const t = COVER_THEMES[themeIdx];
    const W = size.w;
    const H = size.h;
    const scale = 3;
    canvas.width = W * scale;
    canvas.height = H * scale;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(scale, scale);

    // 背景
    ctx.fillStyle = t.bg;
    ctx.fillRect(0, 0, W, H);

    // 装饰圆（横版靠右，竖版右上+左下）
    ctx.fillStyle = t.deco;
    if (W >= H) {
      ctx.beginPath();
      ctx.arc(W - 30, H / 2, H * 0.85, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(W - H * 0.75, H + 20, H * 0.45, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(W - 120, 150, 260, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(60, H - 180, 200, 0, Math.PI * 2);
      ctx.fill();
    }

    const pad = W >= H ? 64 : 108;

    // 顶部标签
    let contentTop = pad * 0.9;
    if (tag.trim()) {
      contentTop = drawTag(ctx, tag.trim(), pad, W >= H ? 52 : 150, t, W >= H ? 24 : 40) + (W >= H ? 34 : 90);
    }

    // 主标题
    const maxTitleLines = W >= H ? 2 : 4;
    const titleSize = W >= H ? 62 : 130;
    const { lines, size: tSize } = fitLines(
      ctx,
      title.trim() || "标题",
      W - pad * 2 - (W >= H ? H * 0.55 : 0),
      maxTitleLines,
      titleSize,
      "700"
    );
    ctx.textBaseline = "top";
    ctx.fillStyle = t.fg;
    ctx.font = `700 ${tSize}px sans-serif`;
    const lh = tSize * 1.32;
    let y = contentTop;
    for (const line of lines) {
      ctx.fillText(line, pad, y);
      y += lh;
    }

    // 标题下划线块
    ctx.fillStyle = t.accent;
    roundRect(ctx, pad, y + (W >= H ? 8 : 10), W >= H ? 90 : 120, W >= H ? 10 : 14, 5);
    ctx.fill();
    y += W >= H ? 26 : 32;

    // 副标题
    if (subtitle.trim()) {
      const sub = fitLines(ctx, subtitle.trim(), W - pad * 2, W >= H ? 1 : 2, W >= H ? 26 : 52, "400");
      ctx.fillStyle = t.sub;
      ctx.font = `400 ${sub.size}px sans-serif`;
      let sy = y + (W >= H ? 6 : 40);
      for (const line of sub.lines) {
        ctx.fillText(line, pad, sy);
        sy += sub.size * 1.5;
      }
    }

    // 作者署名：横版右下，竖版左下
    if (author.trim()) {
      ctx.fillStyle = t.fg;
      ctx.globalAlpha = 0.75;
      ctx.font = `500 ${W >= H ? 22 : 34}px sans-serif`;
      ctx.textAlign = W >= H ? "right" : "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(`@${author.trim()}`, W >= H ? W - pad : pad, W >= H ? H - 30 : H - 120);
      ctx.textAlign = "left";
      ctx.globalAlpha = 1;
      ctx.fillStyle = t.accent;
      roundRect(ctx, pad, H - (W >= H ? 38 : 170), W >= H ? 34 : 44, W >= H ? 7 : 8, 4);
      ctx.fill();
    }
  }, [sizeKey, title, subtitle, tag, author, themeIdx, size]);

  useEffect(() => {
    render();
  }, [render]);

  return (
    <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
      <div className="space-y-4">
        <Panel title="封面内容">
          <div className="space-y-4">
            <Field label="主标题（换行可控制断句）">
              <textarea
                className={`${inputCls} min-h-[80px] resize-y leading-relaxed`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Field>
            <Field label="副标题（可选）">
              <input className={inputCls} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
            </Field>
            <Field label="顶部标签（可选）">
              <input
                className={inputCls}
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="如：AI 实战 / 独立开发"
              />
            </Field>
            <Field label="作者署名（可选）">
              <input className={inputCls} value={author} onChange={(e) => setAuthor(e.target.value)} />
            </Field>
            <Field label="导出文件名（发布器按 slug 自动取封面）">
              <input
                className={inputCls}
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="文章 slug，如 hello-build-in-public"
              />
              <p className="mt-1.5 text-xs leading-relaxed text-stone-400">
                提示：下载后重命名并放到 personal-blog/content/covers/ 目录，公众号发布器推送时会自动采用。
              </p>
            </Field>
          </div>
        </Panel>

        <Panel title="尺寸预设">
          <div className="grid grid-cols-3 gap-2.5">
            {SIZES.map((s) => (
              <button
                key={s.key}
                onClick={() => setSizeKey(s.key)}
                className={`rounded-xl border-2 p-2.5 text-left transition-all ${
                  sizeKey === s.key
                    ? "border-indigo-500 bg-indigo-50/50"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <div className="text-xs font-semibold text-stone-700">{s.label}</div>
                <div className="mt-0.5 text-[11px] text-stone-400">
                  {s.w}×{s.h} · {s.ratio}
                </div>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="配色模板">
          <div className="grid grid-cols-4 gap-2.5">
            {COVER_THEMES.map((t, i) => (
              <button
                key={t.name}
                onClick={() => setThemeIdx(i)}
                className={`rounded-xl border-2 p-2 text-left transition-all ${
                  themeIdx === i
                    ? "border-indigo-500 bg-indigo-50/50"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <div className="mb-1.5 flex gap-1">
                  <span className="h-4 w-4 rounded-full border border-black/5" style={{ background: t.bg }} />
                  <span className="h-4 w-4 rounded-full border border-black/5" style={{ background: t.accent }} />
                  <span className="h-4 w-4 rounded-full border border-black/5" style={{ background: t.fg }} />
                </div>
                <span className="text-[11px] font-medium text-stone-600">{t.name}</span>
              </button>
            ))}
          </div>
          <Button
            variant="secondary"
            className="mt-4 w-full"
            onClick={() => setThemeIdx((i) => (i + Math.floor(Math.random() * 7) + 1) % COVER_THEMES.length)}
          >
            <Shuffle className="h-4 w-4" />
            随机换一个配色
          </Button>
        </Panel>

        <Button
          className="w-full"
          onClick={() =>
            canvasRef.current?.toBlob(
              (b) =>
                b &&
                downloadBlob(
                  b,
                  `${filename.trim() || "cover"}-${size.w}x${size.h}.png`
                ),
              "image/png"
            )
          }
        >
          <Download className="h-4 w-4" />
          下载封面（{size.w}×{size.h} · 3x 高清）
        </Button>
      </div>

      <Panel title={`实时预览（${size.ratio}）`}>
        <div
          className={`mx-auto overflow-hidden rounded-xl shadow-md ring-1 ring-black/5 ${
            W_GREATER_H.has(sizeKey) ? "max-w-[560px]" : "max-w-[360px]"
          }`}
        >
          <canvas ref={canvasRef} className="block h-auto w-full" />
        </div>
      </Panel>
    </div>
  );
}

const W_GREATER_H = new Set<SizeKey>(["wechat-head"]);
