"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Download, Play, Pause, Trash2 } from "lucide-react";
import {
  Button,
  FileDrop,
  Panel,
  Slider,
  downloadBlob,
} from "@/components/ui";

interface Frame {
  id: string;
  file: File;
  url: string;
  img: HTMLImageElement;
}

export function GifGenerator() {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [delay, setDelay] = useState(400);
  const [width, setWidth] = useState(480);
  const [playing, setPlaying] = useState(true);
  const [exporting, setExporting] = useState(false);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const playIdx = useRef(0);

  const loadFiles = useCallback((files: File[]) => {
    const imgs = files.filter((f) => f.type.startsWith("image/"));
    for (const file of imgs) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setFrames((prev) => [...prev, { id: crypto.randomUUID(), file, url, img }]);
      };
      img.src = url;
    }
  }, []);

  // 预览播放
  useEffect(() => {
    if (!frames.length || !playing) return;
    const canvas = previewRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const f = frames[playIdx.current % frames.length];
      const w = width;
      const h = Math.round((f.img.naturalHeight / f.img.naturalWidth) * w);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      ctx.drawImage(f.img, 0, 0, w, h);
      playIdx.current++;
      timer = setTimeout(tick, delay);
    };
    tick();
    return () => clearTimeout(timer);
  }, [frames, delay, width, playing]);

  const move = (idx: number, dir: -1 | 1) => {
    setFrames((prev) => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
  };

  const exportGif = async () => {
    if (frames.length < 2 || exporting) return;
    setExporting(true);
    try {
      const { GIFEncoder, quantize, applyPalette } = await import("gifenc");
      const gif = GIFEncoder();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

      // 统一画布尺寸：以第一帧比例为准
      const first = frames[0].img;
      const w = width;
      const h = Math.round((first.naturalHeight / first.naturalWidth) * w);
      canvas.width = w;
      canvas.height = h;

      for (const f of frames) {
        ctx.clearRect(0, 0, w, h);
        // cover 绘制，保证每帧填满画布
        const ar = f.img.naturalWidth / f.img.naturalHeight;
        const targetAr = w / h;
        let sw = f.img.naturalWidth;
        let sh = f.img.naturalHeight;
        let sx = 0;
        let sy = 0;
        if (ar > targetAr) {
          sw = f.img.naturalHeight * targetAr;
          sx = (f.img.naturalWidth - sw) / 2;
        } else {
          sh = f.img.naturalWidth / targetAr;
          sy = (f.img.naturalHeight - sh) / 2;
        }
        ctx.drawImage(f.img, sx, sy, sw, sh, 0, 0, w, h);
        const { data } = ctx.getImageData(0, 0, w, h);
        const palette = quantize(data, 256);
        const index = applyPalette(data, palette);
        gif.writeFrame(index, w, h, { palette, delay });
      }
      gif.finish();
      downloadBlob(
        new Blob([gif.bytes().slice().buffer as ArrayBuffer], { type: "image/gif" }),
        `合成动图-${Date.now()}.gif`
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <div className="space-y-4">
        <Panel title="参数">
          <div className="space-y-5">
            <Slider label="每帧间隔" value={delay} min={100} max={2000} step={50} suffix="ms" onChange={setDelay} />
            <Slider label="宽度" value={width} min={200} max={800} step={40} suffix="px" onChange={setWidth} />
            <Button
              className="w-full"
              disabled={frames.length < 2 || exporting}
              onClick={exportGif}
            >
              <Download className="h-4 w-4" />
              {exporting ? "编码中…" : `合成 GIF（${frames.length} 帧）`}
            </Button>
            <p className="rounded-lg bg-stone-50 px-3 py-2 text-xs leading-relaxed text-stone-500">
              至少需要 2 帧。帧越多、尺寸越大，编码耗时越长，全部在本地完成。
            </p>
          </div>
        </Panel>
      </div>

      <div className="space-y-4">
        {frames.length > 0 && (
          <Panel title="预览">
            <div className="flex justify-center">
              <canvas
                ref={previewRef}
                className="max-h-[420px] w-auto max-w-full rounded-lg ring-1 ring-black/5"
              />
            </div>
            <div className="mt-4 flex justify-center">
              <Button variant="secondary" onClick={() => setPlaying((p) => !p)}>
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {playing ? "暂停" : "播放"}
              </Button>
            </div>
          </Panel>
        )}

        {frames.length > 0 && (
          <Panel title={`帧序列（${frames.length}）`}>
            <div className="space-y-2">
              {frames.map((f, i) => (
                <div
                  key={f.id}
                  className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-2.5 shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.url} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  <span className="flex-1 truncate text-sm text-stone-700">
                    <b className="mr-2 font-mono text-stone-400">#{i + 1}</b>
                    {f.file.name}
                  </span>
                  <Button variant="ghost" className="!px-2" onClick={() => move(i, -1)} disabled={i === 0}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="!px-2"
                    onClick={() => move(i, 1)}
                    disabled={i === frames.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="!px-2 text-stone-400 hover:!text-red-600"
                    onClick={() => setFrames((p) => p.filter((x) => x.id !== f.id))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Panel>
        )}

        <FileDrop
          accept="image/*"
          multiple
          onFiles={loadFiles}
          hint="按选择顺序合成，可在帧序列中调整顺序"
        />
      </div>
    </div>
  );
}
