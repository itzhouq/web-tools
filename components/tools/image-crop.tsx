"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Crop, Download, RotateCcw } from "lucide-react";
import {
  Button,
  FileDrop,
  Panel,
  Segmented,
  Slider,
  downloadBlob,
} from "@/components/ui";

type Ratio = "free" | "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

const RATIOS: Record<Exclude<Ratio, "free">, number> = {
  "1:1": 1,
  "3:4": 3 / 4,
  "4:3": 4 / 3,
  "9:16": 9 / 16,
  "16:9": 16 / 9,
};

interface ImgState {
  file: File;
  img: HTMLImageElement;
  url: string;
  dispW: number;
  dispH: number;
  scale: number; // 显示 / 原始
}

export function ImageCrop() {
  const [state, setState] = useState<ImgState | null>(null);
  const [ratio, setRatio] = useState<Ratio>("1:1");
  const [zoom, setZoom] = useState(80); // 裁剪框占最大框的百分比
  // 裁剪框（显示坐标）
  const boxRef = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const [, force] = useState(0);
  const dragging = useRef<{ sx: number; sy: number; bx: number; by: number } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  /** 根据比例与 zoom 重算裁剪框并居中 */
  const resetBox = useCallback(
    (s: ImgState, r: Ratio, z: number) => {
      const maxW = s.dispW * 0.92;
      const maxH = s.dispH * 0.92;
      let w: number, h: number;
      if (r === "free") {
        w = maxW * (z / 100);
        h = maxH * (z / 100);
      } else {
        const ar = RATIOS[r];
        // 以最大内接比例框为 100%
        if (maxW / maxH > ar) {
          h = maxH;
          w = h * ar;
        } else {
          w = maxW;
          h = w / ar;
        }
        w *= z / 100;
        h *= z / 100;
      }
      boxRef.current = {
        x: (s.dispW - w) / 2,
        y: (s.dispH - h) / 2,
        w,
        h,
      };
      force((n) => n + 1);
    },
    []
  );

  const loadFile = useCallback(
    (file: File) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const maxW = 620;
        const scale = Math.min(1, maxW / img.naturalWidth);
        const s: ImgState = {
          file,
          img,
          url,
          scale,
          dispW: Math.round(img.naturalWidth * scale),
          dispH: Math.round(img.naturalHeight * scale),
        };
        setState(s);
        resetBox(s, ratio, zoom);
      };
      img.src = url;
    },
    [ratio, zoom, resetBox]
  );

  // 比例 / 缩放变化时重置裁剪框
  useEffect(() => {
    if (state) resetBox(state, ratio, zoom);
  }, [ratio, zoom, state, resetBox]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!state) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const b = boxRef.current;
    dragging.current = { sx: e.clientX, sy: e.clientY, bx: b.x, by: b.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragging.current;
    if (!d || !state) return;
    const b = boxRef.current;
    let nx = d.bx + (e.clientX - d.sx);
    let ny = d.by + (e.clientY - d.sy);
    nx = Math.max(0, Math.min(state.dispW - b.w, nx));
    ny = Math.max(0, Math.min(state.dispH - b.h, ny));
    boxRef.current = { ...b, x: nx, y: ny };
    force((n) => n + 1);
  };
  const onPointerUp = () => {
    dragging.current = null;
  };

  const exportCrop = () => {
    if (!state || !imgRef.current) return;
    const b = boxRef.current;
    const sx = Math.round(b.x / state.scale);
    const sy = Math.round(b.y / state.scale);
    const sw = Math.max(1, Math.round(b.w / state.scale));
    const sh = Math.max(1, Math.round(b.h / state.scale));
    const canvas = document.createElement("canvas");
    canvas.width = sw;
    canvas.height = sh;
    canvas.getContext("2d")!.drawImage(state.img, sx, sy, sw, sh, 0, 0, sw, sh);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const base = state.file.name.replace(/\.[^.]+$/, "");
        downloadBlob(blob, `${base}-cropped-${sw}x${sh}.png`);
      },
      "image/png"
    );
  };

  const b = boxRef.current;

  return (
    <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
      <div className="space-y-4">
        <Panel title="裁剪设置">
          <div className="space-y-5">
            <div>
              <span className="mb-1.5 block text-[13px] font-medium text-stone-600">
                比例
              </span>
              <Segmented
                value={ratio}
                onChange={setRatio}
                options={[
                  { value: "free", label: "自由" },
                  { value: "1:1", label: "1:1" },
                  { value: "3:4", label: "3:4" },
                  { value: "4:3", label: "4:3" },
                  { value: "9:16", label: "9:16" },
                  { value: "16:9", label: "16:9" },
                ]}
              />
            </div>
            <Slider
              label="裁剪框大小"
              value={zoom}
              min={20}
              max={100}
              suffix="%"
              onChange={setZoom}
            />
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                onClick={() => state && resetBox(state, ratio, zoom)}
                disabled={!state}
              >
                <RotateCcw className="h-4 w-4" />
                居中重置
              </Button>
              <Button onClick={exportCrop} disabled={!state}>
                <Download className="h-4 w-4" />
                导出 PNG
              </Button>
            </div>
            {state && (
              <p className="rounded-lg bg-stone-50 px-3 py-2 text-xs leading-relaxed text-stone-500">
                输出分辨率约{" "}
                <b className="font-mono">
                  {Math.round(b.w / state.scale)}×{Math.round(b.h / state.scale)}
                </b>{" "}
                像素（按原图分辨率无损导出）
              </p>
            )}
          </div>
        </Panel>
      </div>

      <Panel title="裁剪预览">
        {!state ? (
          <FileDrop
            accept="image/*"
            onFiles={(files) => files[0] && loadFile(files[0])}
            hint="支持 JPG / PNG / WebP，按原图分辨率导出"
          />
        ) : (
          <div className="flex justify-center">
            <div
              ref={stageRef}
              className="relative select-none"
              style={{ width: state.dispW, height: state.dispH, cursor: "move" }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={state.url}
                alt=""
                className="pointer-events-none absolute inset-0 rounded-lg"
                style={{ width: state.dispW, height: state.dispH }}
                draggable={false}
              />
              {/* 遮罩：四块半透明区域 */}
              <div className="pointer-events-none absolute inset-0">
                <div
                  className="absolute bg-stone-900/55"
                  style={{ left: 0, top: 0, right: 0, height: Math.max(0, b.y) }}
                />
                <div
                  className="absolute bg-stone-900/55"
                  style={{
                    left: 0,
                    top: b.y + b.h,
                    right: 0,
                    bottom: 0,
                  }}
                />
                <div
                  className="absolute bg-stone-900/55"
                  style={{ left: 0, top: b.y, width: Math.max(0, b.x), height: b.h }}
                />
                <div
                  className="absolute bg-stone-900/55"
                  style={{
                    left: b.x + b.w,
                    top: b.y,
                    right: 0,
                    height: b.h,
                  }}
                />
                {/* 裁剪框 */}
                <div
                  className="absolute border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
                  style={{ left: b.x, top: b.y, width: b.w, height: b.h }}
                >
                  {/* 三分线 */}
                  <div className="absolute inset-0 opacity-40">
                    <div className="absolute left-1/3 top-0 h-full w-px bg-white" />
                    <div className="absolute left-2/3 top-0 h-full w-px bg-white" />
                    <div className="absolute top-1/3 h-px w-full bg-white" />
                    <div className="absolute top-2/3 h-px w-full bg-white" />
                  </div>
                  <span className="absolute -bottom-6 left-0 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-white">
                    {Math.round(b.w / state.scale)}×{Math.round(b.h / state.scale)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        {state && (
          <p className="mt-8 flex items-center justify-center gap-1.5 text-center text-xs text-stone-400">
            <Crop className="h-3.5 w-3.5" />
            在图上拖拽移动裁剪框，导出时按原图分辨率裁切
          </p>
        )}
      </Panel>
    </div>
  );
}
