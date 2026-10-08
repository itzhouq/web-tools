"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown, CalendarClock } from "lucide-react";
import { Button, CopyButton, Field, Panel, inputCls, useNow } from "@/components/ui";

const FORMATS = [
  { label: "本地时间", fn: (d: Date) => d.toLocaleString("zh-CN", { hour12: false }) },
  { label: "ISO 8601", fn: (d: Date) => d.toISOString() },
  { label: "仅日期", fn: (d: Date) => d.toLocaleDateString("zh-CN") },
  { label: "仅时间", fn: (d: Date) => d.toLocaleTimeString("zh-CN", { hour12: false }) },
];

export function TimestampTool() {
  const now = useNow(1000);

  // 时间戳 → 日期
  const [tsInput, setTsInput] = useState("");
  const parsedTs = useMemo(() => {
    const t = tsInput.trim();
    if (!t) return null;
    if (!/^\d{10,13}$/.test(t)) return "invalid" as const;
    const n = Number(t);
    return n > 1e12 ? n : n * 1000; // 自动识别秒/毫秒
  }, [tsInput]);

  // 日期 → 时间戳
  const [dateInput, setDateInput] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const parsedDate = useMemo(() => {
    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? null : d;
  }, [dateInput]);

  // 当前时间戳
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [frozen, setFrozen] = useState<number | null>(null);
  useEffect(() => {
    if (autoRefresh) setFrozen(null);
  }, [autoRefresh]);
  const current = frozen ?? now;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* 当前时间戳 */}
      <Panel>
        <div className="text-center">
          <p className="text-[13px] font-medium text-stone-500">
            当前 Unix 时间戳（秒）
          </p>
          <p className="mt-2 font-mono text-4xl font-bold tabular-nums tracking-tight text-stone-900">
            {Math.floor(current / 1000)}
          </p>
          <p className="mt-1 text-xs tabular-nums text-stone-400">
            毫秒 {current} · {new Date(current).toLocaleString("zh-CN", { hour12: false })}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setFrozen(Date.now());
                setAutoRefresh(false);
              }}
            >
              定格当前值
            </Button>
            <CopyButton text={String(Math.floor(current / 1000))} label="复制秒" />
            <CopyButton text={String(current)} label="复制毫秒" />
          </div>
        </div>
      </Panel>

      {/* 时间戳 → 日期 */}
      <Panel title="时间戳 → 日期">
        <div className="space-y-3">
          <input
            className={`${inputCls} font-mono`}
            value={tsInput}
            onChange={(e) => setTsInput(e.target.value)}
            placeholder="输入 10 位秒或 13 位毫秒时间戳，自动识别"
          />
          {parsedTs === "invalid" ? (
            <p className="text-xs text-red-600">
              请输入 10 位（秒）或 13 位（毫秒）数字时间戳
            </p>
          ) : parsedTs ? (
            <div className="space-y-2">
              {FORMATS.map((f) => (
                <div
                  key={f.label}
                  className="flex items-center justify-between rounded-lg bg-stone-50 px-3.5 py-2.5"
                >
                  <div>
                    <p className="text-[11px] text-stone-400">{f.label}</p>
                    <p className="font-mono text-sm text-stone-800">
                      {f.fn(new Date(parsedTs))}
                    </p>
                  </div>
                  <CopyButton
                    text={f.fn(new Date(parsedTs))}
                    label="复制"
                    className="!px-2.5 !py-1.5 text-xs"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-400">等待输入…</p>
          )}
        </div>
      </Panel>

      {/* 日期 → 时间戳 */}
      <Panel title="日期 → 时间戳">
        <div className="flex flex-wrap items-end gap-3">
          <Field label="选择本地时间">
            <input
              type="datetime-local"
              className={`${inputCls} font-mono`}
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
            />
          </Field>
          <Button
            variant="secondary"
            onClick={() => {
              const d = new Date();
              d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
              setDateInput(d.toISOString().slice(0, 16));
            }}
          >
            <CalendarClock className="h-4 w-4" />
            现在
          </Button>
        </div>
        {parsedDate && (
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {[
              { label: "秒级时间戳", value: String(Math.floor(parsedDate.getTime() / 1000)) },
              { label: "毫秒级时间戳", value: String(parsedDate.getTime()) },
            ].map((r) => (
              <div
                key={r.label}
                className="rounded-xl border border-stone-200 bg-white px-3.5 py-3 shadow-sm"
              >
                <p className="text-[11px] text-stone-400">{r.label}</p>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <p className="truncate font-mono text-sm font-semibold text-stone-800">
                    {r.value}
                  </p>
                  <CopyButton text={r.value} label="" className="!px-2 !py-1" />
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-stone-400">
        <ArrowUpDown className="h-3.5 w-3.5" />
        所有换算均在浏览器本地完成，时区取自你的设备设置
      </p>
    </div>
  );
}
