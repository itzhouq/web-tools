"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import {
  Button,
  FileDrop,
  Panel,
  Segmented,
  Slider,
  downloadBlob,
} from "@/components/ui";

type Ratio = "3:4" | "1:1" | "4:3" | "9:16";
const RATIOS: Record<Ratio, number> = { "3:4": 3 / 4, "1:1": 1, "4:3": 4 / 3, "9:16": 9 / 16 };

interface Loaded {
  file: File;
  url: string;
  img: HTMLImageElement;
  w: number;
  h: number;
}

interface Cut {
  y: number; // 原图坐标切线位置
  safe: boolean; // 是否找到安全切线
}

/** 在 [target-tol, target+tol] 范围内寻找内容能量最低的行（安全切线） */
function findSafeCut(
  img: HTMLImageElement,
  targetY: number,
  tolPx: number
): { y: number; energy: number } {
  // 降采样行能量：横向 RGB 差分之和
  const SW = 120;
  const canvas = document.createElement("canvas");
  canvas.width = SW;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, SW, img.naturalHeight);
  const { data } = ctx.getImageData(0, 0, SW, img.naturalHeight);

  const gray = new Float32Array(img.naturalHeight * SW);
  for (let y = 0; y < img.naturalHeight; y++) {
    for (let x = 0; x < SW; x++) {
      const i = (y * SW + x) * 4;
      gray[y * SW + x] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
  }

  const from = Math.max(1, Math.round(targetY - tolPx));
  const to = Math.min(img.naturalHeight - 2, Math.round(targetY + tolPx));
  let bestY = targetY;
  let bestEnergy = Infinity;
  for (let y = from; y <= to; y++) {
    let energy = 0;
    const row = y * SW;
    const prev = (y - 1) * SW;
    for (let x = 1; x < SW; x++) {
      energy += Math.abs(gray[row + x] - gray[row + x - 1]);
      energy += Math.abs(gray[row + x] - gray[prev + x]);
    }
    if (energy < bestEnergy) {
      bestEnergy = energy;
      bestY = y;
    }
  }
  return { y: bestY, energy: bestEnergy };
}

export function LongImageSlicer() {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [ratio, setRatio] = useState<Ratio>("3:4");
  const [tolerance, setTolerance] = useState(8); // 安全切线搜索范围 %
  const [cuts, setCuts] = useState<Cut[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const loadFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setLoaded({ file, url, img, w: img.naturalWidth, h: img.naturalHeight });
    };
    img.src = url;
  }, []);

  const computeCuts = useCallback(
    (l: Loaded, r: Ratio, tol: number) => {
      const targetH = l.w / RATIOS[r]; // 每片理想高度
      const tolPx = (l.w * tol) / 100;
      const list: Cut[] = [];
      let y = targetH;
      let guard = 0;
      while (y < l.h - targetH * 0.3 && guard++ < 50) {
        const { y: safeY } = findSafeCut(l.img, y, tolPx);
        list.push({ y: safeY, safe: Math.abs(safeY - y) > 1 });
        y = safeY + targetH;
      }
      setCuts(list);
    },
    []
  );

  useEffect(() => {
    if (!loaded) return;
    computeCuts(loaded, ratio, tolerance);
  }, [loaded, ratio, tolerance, computeCuts]);

  // 绘制预览
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !loaded) return;
    const ctx = canvas.getContext("2d")!;
    const dispW = 320;
    const scale = dispW / loaded.w;
    const dispH = loaded.h * scale;
    canvas.width = dispW;
    canvas.height = dispH;
    ctx.drawImage(loaded.img, 0, 0, dispW, dispH);
    ctx.font = "600 11px sans-serif";
    cuts.forEach((c, i) => {
      const y = c.y * scale;
      ctx.strokeStyle = c.safe ? "#f59e0b" : "#e11d48";
      ctx.lineWidth = 1.5;
      ctx.setLineDash(c.safe ? [5, 4] : []);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(dispW, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = c.safe ? "#f59e0b" : "#e11d48";
      ctx.fillText(String(i + 1), 6, y - 4);
    });
  }, [loaded, cuts]);

  const sliceCount = cuts.length + 1;

  const exportSlices = () => {
    if (!loaded) return;
    const base = loaded.file.name.replace(/\.[^.]+$/, "");
    const bounds = [0, ...cuts.map((c) => c.y), loaded.h];
    const pieces: { sy: number; sh: number }[] = [];
    for (let i = 0; i < bounds.length - 1; i++) {
      const sy = Math.round(bounds[i]);
      const sh = Math.round(bounds[i + 1]) - sy;
      if (sh > 2) pieces.push({ sy, sh });
    }
    pieces.forEach((p, i) => {
      const canvas = document.createElement("canvas");
      canvas.width = loaded.w;
      canvas.height = p.sh;
      canvas
        .getContext("2d")!
        .drawImage(loaded.img, 0, p.sy, loaded.w, p.sh, 0, 0, loaded.w, p.sh);
      canvas.toBlob((b) => {
        if (!b) return;
        // 错峰触发，避免浏览器拦截连续下载
        setTimeout(() => downloadBlob(b, `${base}-${String(i + 1).padStart(2, "0")}.png`), i * 400);
      }, "image/png");
    });
    // 已在 toBlob 回调中异步下载，无需额外处理
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <div className="space-y-4">
        <Panel title="切片设置">
          <div className="space-y-5">
            <div>
              <span className="mb-1.5 block text-[13px] font-medium text-stone-600">
                每片比例
              </span>
              <Segmented
                value={ratio}
                onChange={setRatio}
                options={[
                  { value: "3:4", label: "3:4" },
                  { value: "1:1", label: "1:1" },
                  { value: "4:3", label: "4:3" },
                  { value: "9:16", label: "9:16" },
                ]}
              />
            </div>
            <Slider
              label="安全切线搜索范围"
              value={tolerance}
              min={0}
              max={20}
              suffix="%"
              onChange={setTolerance}
            />
            <div className="rounded-lg bg-stone-50 px-3 py-2.5 text-xs leading-relaxed text-stone-500">
              将切成 <b className="text-stone-800">{sliceCount}</b> 片
              {cuts.some((c) => c.safe) && (
                <>
                  ，其中{" "}
                  <b className="text-amber-600">
                    {cuts.filter((c) => c.safe).length}
                  </b>{" "}
                  处切线已自动微调到内容空白处
                </>
              )}
            </div>
            <Button className="w-full" disabled={!loaded} onClick={exportSlices}>
              <Download className="h-4 w-4" />
              逐张下载全部切片
            </Button>
            <p className="text-xs leading-relaxed text-stone-400">
              红色实线表示该处内容密集、未找到更优切线；黄色虚线表示已避开内容。
            </p>
          </div>
        </Panel>
      </div>

      <Panel title="切线预览">
        {!loaded ? (
          <FileDrop
            accept="image/*"
            onFiles={(files) => files[0] && loadFile(files[0])}
            hint="适合聊天记录、攻略长图等需要分段发布的场景"
          />
        ) : (
          <div className="flex justify-center">
            <canvas ref={canvasRef} className="max-h-[560px] w-auto max-w-full rounded-lg shadow-sm ring-1 ring-black/5" />
          </div>
        )}
      </Panel>
    </div>
  );
}
