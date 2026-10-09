"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { CopyButton, Panel, Segmented, inputCls } from "@/components/ui";

type Direction = "s2t" | "t2s";
type Variant = "standard" | "tw" | "hk";

const SAMPLE =
  "这个项目支持内存优化和矢量图标，社区里很多开发者喜欢通过简繁转换来发布双语说明。";

export function ChineseConverter() {
  const [direction, setDirection] = useState<Direction>("s2t");
  const [variant, setVariant] = useState<Variant>("standard");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [ready, setReady] = useState(false);
  const cvtRef = useRef<((s: string) => string) | null>(null);

  // 方向或地区变化时重建转换器
  useEffect(() => {
    let cancelled = false;
    setReady(false);
    import("opencc-js").then((OpenCC) => {
      if (cancelled) return;
      const from = direction === "s2t" ? "cn" : variant === "standard" ? "t" : variant;
      const to = direction === "s2t" ? (variant === "standard" ? "t" : variant) : "cn";
      cvtRef.current = OpenCC.Converter({
        from: from as "cn",
        to: to as "cn",
      });
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [direction, variant]);

  // 输入或转换器变化时实时转换
  useEffect(() => {
    if (!ready || !cvtRef.current) return;
    setOutput(input ? cvtRef.current(input) : "");
  }, [input, ready]);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-4">
        <Panel
          title={
            <span className="flex flex-wrap items-center gap-2">
              <Segmented
                value={direction}
                onChange={setDirection}
                options={[
                  { value: "s2t", label: "简 → 繁" },
                  { value: "t2s", label: "繁 → 简" },
                ]}
              />
              <Segmented
                value={variant}
                onChange={setVariant}
                options={[
                  { value: "standard", label: "通用" },
                  { value: "tw", label: "台湾" },
                  { value: "hk", label: "香港" },
                ]}
              />
            </span>
          }
        >
          <textarea
            className={`${inputCls} min-h-[260px] resize-y leading-relaxed`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={direction === "s2t" ? "在这里输入简体中文…" : "在這裡輸入繁體中文…"}
          />
          <div className="mt-3 flex items-center justify-between">
            <button
              className="text-xs text-indigo-600 hover:underline"
              onClick={() => setInput(SAMPLE)}
            >
              填入示例
            </button>
            <span className="text-xs tabular-nums text-stone-400">{input.length} 字</span>
          </div>
        </Panel>
      </div>

      <div className="space-y-4">
        <Panel
          title={
            <span className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ArrowLeftRight className="h-4 w-4 text-stone-400" />
                转换结果
              </span>
              <CopyButton text={output} label="复制" className="!px-2 !py-1 text-xs" />
            </span>
          }
        >
          <div className="min-h-[260px] whitespace-pre-wrap rounded-lg bg-stone-50 p-4 text-[15px] leading-8 text-stone-700">
            {output || (
              <span className="text-sm text-stone-400">
                {ready ? "输入内容后实时转换" : "词典加载中…"}
              </span>
            )}
          </div>
          {input && output && (
            <p className="mt-3 text-xs text-stone-400">
              {direction === "s2t" ? "繁体" : "简体"}输出 · {output.length} 字 · 词典由
              OpenCC 提供，全程本地完成
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}
