"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";
import {
  Button,
  Field,
  Panel,
  Segmented,
  Slider,
  downloadBlob,
  inputCls,
} from "@/components/ui";

type EcLevel = "L" | "M" | "Q" | "H";

export function QrCodeTool() {
  const [text, setText] = useState("https://itzhouq.cn");
  const [size, setSize] = useState(512);
  const [margin, setMargin] = useState(2);
  const [dark, setDark] = useState("#1c1917");
  const [light, setLight] = useState("#ffffff");
  const [ecLevel, setEcLevel] = useState<EcLevel>("M");
  const [logo, setLogo] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const render = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      await QRCode.toCanvas(canvas, text || " ", {
        width: size,
        margin,
        color: { dark, light },
        errorCorrectionLevel: ecLevel,
      });
    } catch {
      return;
    }
    if (logo) {
      const ctx = canvas.getContext("2d")!;
      const img = new Image();
      await new Promise<void>((res) => {
        img.onload = () => res();
        img.src = logo;
      });
      const logoSize = size * 0.22;
      const x = (size - logoSize) / 2;
      const y = (size - logoSize) / 2;
      const pad = logoSize * 0.12;
      // 白底托盘
      ctx.fillStyle = light;
      ctx.beginPath();
      const r = logoSize * 0.18;
      ctx.roundRect(x - pad, y - pad, logoSize + pad * 2, logoSize + pad * 2, r);
      ctx.fill();
      // 等比缩放居中
      const scale = Math.min(logoSize / img.width, logoSize / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, x + (logoSize - w) / 2, y + (logoSize - h) / 2, w, h);
    }
  }, [text, size, margin, dark, light, ecLevel, logo]);

  useEffect(() => {
    render();
  }, [render]);

  return (
    <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
      <div className="space-y-4">
        <Panel title="内容">
          <textarea
            className={`${inputCls} min-h-[90px] resize-y`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="输入网址或任意文本…"
          />
        </Panel>

        <Panel title="样式">
          <div className="space-y-5">
            <Slider label="尺寸" value={size} min={256} max={1024} step={64} suffix="px" onChange={setSize} />
            <Slider label="留白" value={margin} min={0} max={8} onChange={setMargin} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="前景色">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={dark}
                    onChange={(e) => setDark(e.target.value)}
                    className="h-9 w-10 cursor-pointer rounded-lg border border-stone-300 bg-white p-1"
                  />
                  <span className="font-mono text-xs text-stone-500">{dark}</span>
                </div>
              </Field>
              <Field label="背景色">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={light}
                    onChange={(e) => setLight(e.target.value)}
                    className="h-9 w-10 cursor-pointer rounded-lg border border-stone-300 bg-white p-1"
                  />
                  <span className="font-mono text-xs text-stone-500">{light}</span>
                </div>
              </Field>
            </div>
            <div>
              <span className="mb-1.5 block text-[13px] font-medium text-stone-600">
                容错等级
                <span className="ml-2 font-normal text-stone-400">
                  越高越耐遮挡，加 Logo 建议 H
                </span>
              </span>
              <Segmented
                value={ecLevel}
                onChange={setEcLevel}
                options={[
                  { value: "L", label: "L 7%" },
                  { value: "M", label: "M 15%" },
                  { value: "Q", label: "Q 25%" },
                  { value: "H", label: "H 30%" },
                ]}
              />
            </div>

            <Field label="中央 Logo（可选）">
              <div className="flex gap-2">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setLogo(URL.createObjectURL(f));
                    e.target.value = "";
                  }}
                />
                <Button variant="secondary" className="flex-1" onClick={() => logoInputRef.current?.click()}>
                  选择图片
                </Button>
                {logo && (
                  <Button variant="ghost" className="text-stone-400" onClick={() => setLogo(null)}>
                    移除
                  </Button>
                )}
              </div>
            </Field>
          </div>
        </Panel>

        <Button
          className="w-full"
          onClick={() =>
            canvasRef.current?.toBlob(
              (b) => b && downloadBlob(b, `二维码-${Date.now()}.png`),
              "image/png"
            )
          }
        >
          <Download className="h-4 w-4" />
          下载 PNG
        </Button>
      </div>

      <Panel title="预览">
        <div className="flex justify-center py-6">
          <div className="overflow-hidden rounded-2xl shadow-md ring-1 ring-black/5">
            <canvas ref={canvasRef} className="block" style={{ maxWidth: "100%", height: "auto" }} />
          </div>
        </div>
      </Panel>
    </div>
  );
}
