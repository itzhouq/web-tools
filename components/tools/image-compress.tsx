"use client";

import { useCallback, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import {
  Button,
  FileDrop,
  Panel,
  Segmented,
  Slider,
  downloadBlob,
} from "@/components/ui";

type OutFormat = "auto" | "jpeg" | "webp" | "png";

interface Item {
  id: string;
  file: File;
  name: string;
  origSize: number;
  blob?: Blob;
  url?: string;
  width: number;
  height: number;
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function loadImage(file: File) {
  const url = URL.createObjectURL(file);
  const img = new Image();
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error("load fail"));
    img.src = url;
  });
  URL.revokeObjectURL(url);
  return img;
}

export function ImageCompress() {
  const [items, setItems] = useState<Item[]>([]);
  const [quality, setQuality] = useState(75);
  const [format, setFormat] = useState<OutFormat>("auto");
  const [maxWidth, setMaxWidth] = useState(0); // 0 = 原始尺寸
  const [busy, setBusy] = useState(false);

  const compress = useCallback(
    async (file: File): Promise<Omit<Item, "id">> => {
      const img = await loadImage(file);
      const scale = maxWidth > 0 && img.width > maxWidth ? maxWidth / img.width : 1;
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));

      let outType: string;
      if (format === "auto") {
        outType =
          file.type === "image/png" ? "image/png" : file.type === "image/webp" ? "image/webp" : "image/jpeg";
      } else {
        outType = `image/${format}`;
      }

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      if (outType === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
      }
      ctx.drawImage(img, 0, 0, w, h);

      let blob: Blob;
      if (outType === "image/png") {
        // PNG 无质量参数，先用 CanvasDenoise 简化：直接导出
        blob = await new Promise<Blob>((res) =>
          canvas.toBlob((b) => res(b!), "image/png")
        );
        // 若 PNG 反而更大，退回 JPEG 重编码
        if (blob.size >= file.size && format === "auto") {
          blob = await new Promise<Blob>((res) =>
            canvas.toBlob((b) => res(b!), "image/jpeg", quality / 100)
          );
          outType = "image/jpeg";
        }
      } else {
        blob = await new Promise<Blob>((res) =>
          canvas.toBlob((b) => res(b!), outType, quality / 100)
        );
      }

      const ext = outType.split("/")[1].replace("jpeg", "jpg");
      const base = file.name.replace(/\.[^.]+$/, "");
      const url = URL.createObjectURL(blob);
      return {
        file,
        name: `${base}.${ext}`,
        origSize: file.size,
        blob,
        url,
        width: w,
        height: h,
      };
    },
    [quality, format, maxWidth]
  );

  const onFiles = useCallback(
    async (files: File[]) => {
      const imgs = files.filter((f) => f.type.startsWith("image/"));
      if (!imgs.length) return;
      setBusy(true);
      try {
        // 串行处理避免内存尖峰
        const done: Item[] = [];
        for (const f of imgs) {
          const r = await compress(f);
          done.push({
            id: crypto.randomUUID(),
            file: f,
            name: r.name,
            origSize: r.origSize,
            blob: r.blob,
            url: r.url,
            width: r.width,
            height: r.height,
          });
        }
        setItems((prev) => [...prev, ...done]);
      } finally {
        setBusy(false);
      }
    },
    [compress]
  );

  const totalOrig = items.reduce((s, i) => s + i.origSize, 0);
  const totalNew = items.reduce((s, i) => s + (i.blob?.size ?? i.origSize), 0);
  const savedPct =
    totalOrig > 0 ? Math.max(0, Math.round((1 - totalNew / totalOrig) * 100)) : 0;

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
      {/* 设置 */}
      <div className="space-y-4">
        <Panel title="压缩设置">
          <div className="space-y-5">
            <Slider
              label="压缩质量"
              value={quality}
              min={10}
              max={100}
              suffix="%"
              onChange={setQuality}
            />
            <Slider
              label="最大宽度（0 为原始尺寸）"
              value={maxWidth}
              min={0}
              max={4096}
              step={128}
              suffix="px"
              onChange={setMaxWidth}
            />
            <div>
              <span className="mb-1.5 block text-[13px] font-medium text-stone-600">
                输出格式
              </span>
              <Segmented
                value={format}
                onChange={setFormat}
                options={[
                  { value: "auto", label: "智能" },
                  { value: "jpeg", label: "JPG" },
                  { value: "webp", label: "WebP" },
                  { value: "png", label: "PNG" },
                ]}
              />
            </div>
            <p className="rounded-lg bg-stone-50 px-3 py-2 text-xs leading-relaxed text-stone-500">
              更改设置后，点击下方「重新压缩」即可应用到全部图片。
            </p>
            <Button
              className="w-full"
              disabled={!items.length || busy}
              onClick={async () => {
                const files = items.map((i) => i.file);
                setItems([]);
                onFiles(files);
              }}
            >
              重新压缩
            </Button>
          </div>
        </Panel>
      </div>

      {/* 结果区 */}
      <div className="space-y-4">
        <FileDrop
          accept="image/*"
          multiple
          onFiles={onFiles}
          hint={busy ? "压缩中…" : "支持 JPG / PNG / WebP，可一次选择多张"}
        />

        {items.length > 0 && (
          <>
            <div className="flex items-center justify-between rounded-xl bg-stone-900 px-4 py-3 text-sm text-white shadow-sm">
              <span>
                共 {items.length} 张 · {fmtSize(totalOrig)} →{" "}
                <b className="tabular-nums">{fmtSize(totalNew)}</b>
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                节省 {savedPct}%
              </span>
            </div>

            <div className="space-y-2.5">
              {items.map((item) => {
                const newSize = item.blob?.size ?? item.origSize;
                const pct = Math.max(
                  0,
                  Math.round((1 - newSize / item.origSize) * 100)
                );
                const bigger = newSize >= item.origSize;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3.5 rounded-xl border border-stone-200 bg-white p-3 shadow-sm"
                  >
                    {item.url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.url}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-lg border border-stone-100 object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-stone-800">
                        {item.name}
                      </p>
                      <p className="mt-0.5 text-xs tabular-nums text-stone-500">
                        {fmtSize(item.origSize)} → {fmtSize(newSize)}
                        <span
                          className={`ml-2 font-semibold ${bigger ? "text-amber-600" : "text-emerald-600"}`}
                        >
                          {bigger ? "未明显缩小" : `-${pct}%`}
                        </span>
                        <span className="ml-2 text-stone-400">
                          {item.width}×{item.height}
                        </span>
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      className="!px-2.5"
                      title="下载"
                      onClick={() =>
                        item.blob &&
                        downloadBlob(item.blob, item.name)
                      }
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="!px-2 text-stone-400 hover:!text-red-600"
                      title="移除"
                      onClick={() => {
                        if (item.url) URL.revokeObjectURL(item.url);
                        setItems((p) => p.filter((x) => x.id !== item.id));
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                items.forEach((i, idx) =>
                  setTimeout(() => {
                    if (i.blob) downloadBlob(i.blob, i.name);
                  }, idx * 350)
                );
              }}
            >
              <Download className="h-4 w-4" />
              全部下载
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
