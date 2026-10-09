"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { Button, Field, Panel, Segmented, Slider, downloadBlob, inputCls } from "@/components/ui";

type Theme = "light" | "dark" | "warm" | "mint";

const THEMES: Record<
  Theme,
  { label: string; bg: string; card: string; fg: string; sub: string; accent: string }
> = {
  light: { label: "简约白", bg: "#f5f5f4", card: "#ffffff", fg: "#1c1917", sub: "#78716c", accent: "#4f46e5" },
  dark: { label: "深空黑", bg: "#1c1917", card: "#292524", fg: "#fafaf9", sub: "#a8a29e", accent: "#a5b4fc" },
  warm: { label: "暖阳橙", bg: "#fff7ed", card: "#ffffff", fg: "#431407", sub: "#9a6b4f", accent: "#ea580c" },
  mint: { label: "薄荷绿", bg: "#ecfdf5", card: "#ffffff", fg: "#022c22", sub: "#5f9c8a", accent: "#059669" },
};

/** 中文友好的逐字符换行 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const para of text.split("\n")) {
    if (para === "") {
      lines.push("");
      continue;
    }
    let line = "";
    for (const ch of para) {
      if (ctx.measureText(line + ch).width > maxWidth && line) {
        lines.push(line);
        line = ch;
      } else {
        line += ch;
      }
    }
    lines.push(line);
  }
  return lines;
}

export function TextToImage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [theme, setTheme] = useState<Theme>("light");
  const [width, setWidth] = useState(1080);
  const [padding, setPadding] = useState(96);
  const [fontSize, setFontSize] = useState(34);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const t = THEMES[theme];
    const ctx = canvas.getContext("2d")!;
    const scale = 2; // 高清导出

    const titleSize = fontSize * 1.7;
    const lineHeight = fontSize * 1.85;
    const innerW = width - padding * 2;

    // 预量排版
    const measure = document.createElement("canvas").getContext("2d")!;
    const mScale = scale;
    measure.canvas.width = width * mScale;
    measure.font = `600 ${titleSize * mScale}px sans-serif`;
    const titleLines = title.trim() ? wrapText(measure, title.trim(), innerW * mScale) : [];
    measure.font = `400 ${fontSize * mScale}px sans-serif`;
    const bodyLines = body.trim() ? wrapText(measure, body.trim(), innerW * mScale) : [];

    const titleH = titleLines.length * titleSize * 1.5;
    const bodyH = bodyLines.length * lineHeight;
    const footerH = fontSize * 2.4;
    const contentH = (titleLines.length ? titleH + fontSize * 1.6 : 0) + bodyH + footerH;
    const height = Math.ceil(contentH + padding * 2);

    canvas.width = width * scale;
    canvas.height = height * scale;
    canvas.style.width = "100%";
    ctx.scale(scale, scale);

    // 背景
    ctx.fillStyle = t.bg;
    ctx.fillRect(0, 0, width, height);

    // 卡片
    const cardX = padding / 2;
    const cardY = padding / 2;
    const cardW = width - padding;
    const cardH = height - padding;
    roundRect(ctx, cardX, cardY, cardW, cardH, 28);
    ctx.fillStyle = t.card;
    ctx.fill();

    // 文本区域
    const textX = cardX + padding / 2;
    let y = cardY + padding / 2;
    const maxTextW = cardW - padding;

    if (titleLines.length) {
      ctx.fillStyle = t.fg;
      ctx.font = `600 ${titleSize}px sans-serif`;
      ctx.textBaseline = "top";
      for (const line of titleLines) {
        ctx.fillText(line, textX, y);
        y += titleSize * 1.5;
      }
      // 标题装饰线
      y += fontSize * 0.6;
      ctx.fillStyle = t.accent;
      roundRect(ctx, textX, y, 56, 5, 3);
      ctx.fill();
      y += fontSize;
    }

    ctx.fillStyle = t.fg;
    ctx.font = `400 ${fontSize}px sans-serif`;
    ctx.textBaseline = "top";
    for (const line of bodyLines) {
      ctx.fillText(line, textX, y);
      y += lineHeight;
    }

    // 页脚
    y = cardY + cardH - padding / 2 - fontSize * 1.4;
    ctx.fillStyle = t.sub;
    ctx.font = `400 ${fontSize * 0.62}px sans-serif`;
    ctx.fillText("— 由搞副业的老周itzhouq的工具箱生成 —", textX, y);
  }, [title, body, theme, width, padding, fontSize]);

  useEffect(() => {
    render();
  }, [render]);

  // 预览区高度自适应
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && previewRef.current) {
      previewRef.current.style.height = "auto";
    }
  }, [render]);

  return (
    <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
      <div className="space-y-4">
        <Panel title="内容">
          <div className="space-y-4">
            <Field label="标题（可选）">
              <input
                className={inputCls}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="给图片一个醒目的标题"
              />
            </Field>
            <Field label="正文">
              <textarea
                className={`${inputCls} min-h-[180px] resize-y leading-relaxed`}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="在这里输入要排版的文字…&#10;&#10;支持多行文本，会自动处理中文换行。"
              />
            </Field>
          </div>
        </Panel>

        <Panel title="样式">
          <div className="space-y-5">
            <div>
              <span className="mb-1.5 block text-[13px] font-medium text-stone-600">
                主题
              </span>
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(THEMES) as Theme[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setTheme(k)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition-all ${
                      theme === k
                        ? "border-indigo-500 bg-indigo-50/50"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <span
                      className="h-7 w-full rounded-md border border-black/5"
                      style={{ background: THEMES[k].card }}
                    />
                    <span className="text-[11px] text-stone-500">
                      {THEMES[k].label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <Slider label="画布宽度" value={width} min={720} max={1440} step={60} suffix="px" onChange={setWidth} />
            <Slider label="留白" value={padding} min={40} max={180} step={8} suffix="px" onChange={setPadding} />
            <Slider label="正文字号" value={fontSize} min={24} max={48} suffix="px" onChange={setFontSize} />
          </div>
        </Panel>

        <Button
          className="w-full"
          onClick={() => {
            canvasRef.current?.toBlob(
              (b) => b && downloadBlob(b, `文字图片-${Date.now()}.png`),
              "image/png"
            );
          }}
        >
          <Download className="h-4 w-4" />
          下载 PNG（2x 高清）
        </Button>
      </div>

      <Panel title="实时预览">
        <div ref={previewRef} className="overflow-hidden rounded-xl">
          <canvas ref={canvasRef} className="h-auto w-full" />
        </div>
      </Panel>
    </div>
  );
}

function roundRect(
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
