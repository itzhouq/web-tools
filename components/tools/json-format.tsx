"use client";

import { useMemo, useState } from "react";
import { Download, Eraser, Minimize2, Wand2 } from "lucide-react";
import {
  Button,
  CopyButton,
  Panel,
  Segmented,
  downloadBlob,
  inputCls,
} from "@/components/ui";

interface JsonError {
  message: string;
  line?: number;
  column?: number;
}

interface Stats {
  keys: number;
  depth: number;
  nodes: number;
  type: string;
}

function analyze(value: unknown): Stats {
  let keys = 0;
  let nodes = 0;
  let depth = 0;
  const walk = (v: unknown, d: number) => {
    nodes++;
    depth = Math.max(depth, d);
    if (Array.isArray(v)) {
      v.forEach((x) => walk(x, d + 1));
    } else if (v && typeof v === "object") {
      for (const [, val] of Object.entries(v as object)) {
        keys++;
        walk(val, d + 1);
      }
    }
  };
  walk(value, 1);
  const type = Array.isArray(value)
    ? `array[${value.length}]`
    : value === null
      ? "null"
      : typeof value;
  return { keys, depth, nodes, type };
}

function locateError(text: string, message: string): JsonError {
  const m = /position (\d+)/.exec(message);
  if (!m) return { message };
  const pos = Number(m[1]);
  const before = text.slice(0, pos);
  const line = before.split("\n").length;
  const column = pos - before.lastIndexOf("\n");
  return { message, line, column };
}

/** 轻量 JSON 语法高亮 */
function highlight(json: string): React.ReactNode[] {
  const tokenRe =
    /("(?:\\.|[^"\\])*"\s*:)|("(?:\\.|[^"\\])*")|(\b-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|(\btrue\b|\bfalse\b|\bnull\b)|([{}[\],])/g;
  const out: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (let m = tokenRe.exec(json); m; m = tokenRe.exec(json)) {
    if (m.index > last) out.push(json.slice(last, m.index));
    const cls = m[1]
      ? "text-indigo-600"
      : m[2]
        ? "text-emerald-600"
        : m[3]
          ? "text-amber-600"
          : m[4]
            ? "text-violet-600"
            : "text-stone-400";
    out.push(
      <span key={key++} className={cls}>
        {m[0]}
      </span>
    );
    last = m.index + m[0].length;
  }
  out.push(json.slice(last));
  return out;
}

export function JsonFormat() {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState<"2" | "4" | "tab">("2");
  const [error, setError] = useState<JsonError | null>(null);

  const parsed = useMemo(() => {
    if (!input.trim()) {
      setError(null);
      return null;
    }
    try {
      const value = JSON.parse(input);
      setError(null);
      return value;
    } catch (e) {
      setError(locateError(input, (e as Error).message));
      return null;
    }
  }, [input]);

  const stats = parsed !== null ? analyze(parsed) : null;

  const format = () => {
    if (parsed === null) return;
    const pad =
      indent === "tab" ? "\t" : Number(indent);
    setInput(JSON.stringify(parsed, null, pad as string | number));
  };

  const minify = () => {
    if (parsed === null) return;
    setInput(JSON.stringify(parsed));
  };

  const output = useMemo(() => {
    if (parsed === null || !input.trim()) return null;
    const pad = indent === "tab" ? "\t" : Number(indent);
    return JSON.stringify(parsed, null, pad as string | number);
  }, [parsed, input, indent]);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* 输入 */}
      <div className="space-y-4">
        <Panel
          title={
            <span className="flex items-center justify-between">
              输入 JSON
              <span className="flex gap-1 font-normal">
                <Button
                  variant="ghost"
                  className="!px-2 !py-1 text-xs"
                  disabled={parsed === null}
                  onClick={format}
                  title="格式化"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  格式化
                </Button>
                <Button
                  variant="ghost"
                  className="!px-2 !py-1 text-xs"
                  disabled={parsed === null}
                  onClick={minify}
                  title="压缩"
                >
                  <Minimize2 className="h-3.5 w-3.5" />
                  压缩
                </Button>
                <Button
                  variant="ghost"
                  className="!px-2 !py-1 text-xs text-stone-400"
                  disabled={!input}
                  onClick={() => {
                    setInput("");
                    setError(null);
                  }}
                >
                  <Eraser className="h-3.5 w-3.5" />
                  清空
                </Button>
              </span>
            </span>
          }
        >
          <div className="space-y-3">
            <textarea
              className={`${inputCls} min-h-[300px] resize-y font-mono text-[13px] leading-6`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='{"hello": "world", "count": 42}'
              spellCheck={false}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-stone-600">
                  缩进
                </span>
                <Segmented
                  value={indent}
                  onChange={setIndent}
                  options={[
                    { value: "2", label: "2 空格" },
                    { value: "4", label: "4 空格" },
                    { value: "tab", label: "Tab" },
                  ]}
                />
              </div>
              {input && (
                <span className="text-xs tabular-nums text-stone-400">
                  {input.length} 字符
                </span>
              )}
            </div>
          </div>
        </Panel>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p className="font-semibold">解析失败</p>
            <p className="mt-1 font-mono text-xs leading-relaxed">
              {error.message}
              {error.line !== undefined && (
                <span className="ml-2 font-sans font-medium">
                  （第 {error.line} 行，第 {error.column} 列附近）
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* 输出 */}
      <div className="space-y-4">
        <Panel
          title={
            <span className="flex items-center justify-between">
              格式化结果
              <span className="flex gap-1 font-normal">
                <CopyButton
                  text={output ?? ""}
                  label="复制"
                  className="!px-2 !py-1 text-xs"
                />
                <Button
                  variant="ghost"
                  className="!px-2 !py-1 text-xs"
                  disabled={!output}
                  onClick={() =>
                    output &&
                    downloadBlob(
                      new Blob([output], { type: "application/json" }),
                      "data.json"
                    )
                  }
                >
                  <Download className="h-3.5 w-3.5" />
                  下载
                </Button>
              </span>
            </span>
          }
        >
          {output ? (
            <pre className="max-h-[420px] min-h-[300px] overflow-auto rounded-lg bg-stone-50 p-4 font-mono text-[13px] leading-6 text-stone-700">
              {highlight(output)}
            </pre>
          ) : (
            <div className="flex min-h-[300px] items-center justify-center rounded-lg bg-stone-50 text-sm text-stone-400">
              {input.trim() ? "JSON 存在语法错误，无法格式化" : "等待输入…"}
            </div>
          )}
        </Panel>

        {stats && (
          <div className="grid grid-cols-4 gap-2.5">
            {[
              { label: "根类型", value: stats.type },
              { label: "键数量", value: stats.keys },
              { label: "最大深度", value: stats.depth },
              { label: "节点总数", value: stats.nodes },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-center shadow-sm"
              >
                <p className="truncate text-sm font-semibold tabular-nums text-stone-800">
                  {s.value}
                </p>
                <p className="mt-0.5 text-[11px] text-stone-400">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
