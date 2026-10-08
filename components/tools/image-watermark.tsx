"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import {
  Button,
  Field,
  FileDrop,
  Panel,
  Segmented,
  Slider,
  downloadBlob,
  inputCls,
} from "@/components/ui";

type Mode = "single" | "tile";
type Pos =
  | "top-left" | "top" | "top-right"
  | "left" | "center" | "right"
  | "bottom-left" | "bottom" | "bottom-right";

const POS_GRID: Pos[] = [
  "top-left", "top", "top-right",
  "left", "center", "right",
  "bottom-left", "bottom", "bottom-right",
];

const POS_LABEL: Record<Pos, string> = {
  "top-left": "↖", top: "↑", "top-right": "↗",
  left: "←", center: "●", right: "→",
  "bottom-left": "↙", bottom: "↓", "bottom-right": "↘",
};

interface Loaded {
  file: File;
  url: string;
  img: HTMLImageElement;
  w: number;
  h: number;
}

export function ImageWatermark() {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [text, setText] = useState("@itzhouq");
  const [mode, setMode] = useState<Mode>("single");
  const [pos, setPos] = useState<Pos>("bottom-right");
  const [fontSize, setFontSize] = useState(4); // 占图宽百分比
  const [opacity, setOpacity] = useState(60);
  const [rotation, setRotation] = useState(0);
  const [color, setColor] = useState("#ffffff");
  const [gap, setGap] = useState(6); // 平铺间距，占图宽百分比
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const loadFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setLoaded({ file, url, img, w: img.naturalWidth, h: img.naturalHeight });
    };
    img.src = url;
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !loaded) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = loaded.w;
    canvas.height = loaded.h;
    ctx.drawImage(loaded.img, 0, 0);

    const fs = Math.max(12, (loaded.w * fontSize) / 100);
    ctx.font = `600 ${fs}px sans-serif`;
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity / 100;
    ctx.textBaseline = "middle";

    const drawText = (x: number, y: number, rot: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.textAlign = "center";
      ctx.fillText(text, 0, 0);
      ctx.restore();
    };

    if (mode === "single") {
      const m = loaded.w * 0.05; // 边距
      const tw = ctx.measureText(text).width;
      const th = fs;
      const cxMap: Record<string, number> = {
        left: m + tw / 2,
        center: loaded.w / 2,
        right: loaded.w - m - tw / 2,
      };
      const cyMap: Record<string, number> = {
        top: m + th / 2,
        center: loaded.h / 2,
        bottom: loaded.h - m - th / 2,
      };
      const v = pos.includes("top") ? "top" : pos.includes("bottom") ? "bottom" : "center";
      const hKey = pos.includes("left") ? "left" : pos.includes("right") ? "right" : "center";
      drawText(cxMap[hKey], cyMap[v], rotation);
    } else {
      // 平铺
      const stepX = ctx.measureText(text).width + (loaded.w * gap) / 100;
      const stepY = fs * 2.2 + (loaded.h * gap) / 100;
      const cols = Math.ceil((loaded.w + stepX) / stepX);
      const rows = Math.ceil((loaded.h + stepY) / stepY);
      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          // 奇数行错位
          const offset = r % 2 === 1 ? stepX / 2 : 0;
          drawText(
            c * stepX + offset - (loaded.w * gap) / 200,
            r * stepY,
            rotation
          );
        }
      }
    }
    ctx.globalAlpha = 1;
  }, [loaded, text, mode, pos, fontSize, opacity, rotation, color, gap]);

  useEffect(() => {
    render();
  }, [render]);

  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas || !loaded) return;
    canvas.toBlob((b) => {
      if (!b) return;
      const base = loaded.file.name.replace(/\.[^.]+$/, "");
      downloadBlob(b, `${base}-watermark.png`);
    }, "image/png");
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <div className="space-y-4">
        <Panel title="水印设置">
          <div className="space-y-4">
            <Field label="水印文字">
              <input
                className={inputCls}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="签名、昵称或站点名"
              />
            </Field>
            <div>
              <span className="mb-1.5 block text-[13px] font-medium text-stone-600">
                布局
              </span>
              <Segmented
                value={mode}
                onChange={setMode}
                options={[
                  { value: "single", label: "单个" },
                  { value: "tile", label: "平铺" },
                ]}
              />
            </div>
            {mode === "single" && (
              <div>
                <span className="mb-1.5 block text-[13px] font-medium text-stone-600">
                  位置
                </span>
                <div className="grid w-fit grid-cols-3 gap-1">
                  {POS_GRID.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPos(p)}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition-all ${
                        pos === p
                          ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                          : "border-stone-200 text-stone-400 hover:border-stone-300 hover:text-stone-600"
                      }`}
                    >
                      {POS_LABEL[p]}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {mode === "tile" && (
              <Slider label="平铺间距" value={gap} min={2} max={20} suffix="%" onChange={setGap} />
            )}
            <Slider label="字号" value={fontSize} min={2} max={12} step={0.5} suffix="%" onChange={setFontSize} />
            <Slider label="不透明度" value={opacity} min={10} max={100} suffix="%" onChange={setOpacity} />
            <Slider label="旋转" value={rotation} min={-90} max={90} suffix="°" onChange={setRotation} />
            <Field label="颜色">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-9 w-10 cursor-pointer rounded-lg border border-stone-300 bg-white p-1"
                />
                <span className="font-mono text-xs text-stone-500">{color}</span>
              </div>
            </Field>
          </div>
        </Panel>

        <Button className="w-full" disabled={!loaded} onClick={exportImage}>
          <Download className="h-4 w-4" />
          导出 PNG（原图分辨率）
        </Button>
      </div>

      <Panel title="预览">
        {!loaded ? (
          <FileDrop
            accept="image/*"
            onFiles={(files) => files[0] && loadFile(files[0])}
            hint="支持 JPG / PNG / WebP，按原图分辨率导出"
          />
        ) : (
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              className="max-h-[560px] w-auto max-w-full rounded-lg shadow-sm ring-1 ring-black/5"
            />
          </div>
        )}
      </Panel>
    </div>
  );
}
