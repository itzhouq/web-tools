"use client";

import { useMemo, useState } from "react";
import { Server, ArrowRight } from "lucide-react";
import { Field, Panel, Slider, inputCls } from "@/components/ui";

const FX = 7.2; // USD → CNY 参考汇率
const HOURS_PER_MONTH = 24 * 30;

const SCALE_PRESETS = [
  { label: "1 亿/日", value: 1e8 },
  { label: "10 亿/日", value: 1e9 },
  { label: "100 亿/日", value: 1e10 },
  { label: "1550 亿/日", value: 1.55e11 },
];

function usd(n: number) {
  return (
    "$" +
    n.toLocaleString("en-US", {
      maximumFractionDigits: n < 100 ? 2 : 0,
    })
  );
}

function cny(n: number) {
  return (
    "¥" +
    (n * FX).toLocaleString("zh-CN", {
      maximumFractionDigits: n < 100 ? 1 : 0,
    })
  );
}

function compactTokens(n: number) {
  if (n >= 1e8) return (n / 1e8).toLocaleString("zh-CN", { maximumFractionDigits: 1 }) + " 亿";
  if (n >= 1e4) return (n / 1e4).toLocaleString("zh-CN", { maximumFractionDigits: 1 }) + " 万";
  return n.toLocaleString("zh-CN", { maximumFractionDigits: 0 });
}

function NumInput({
  value,
  onChange,
  step = "any",
  min = 0,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: string | number;
  min?: number;
  suffix?: string;
}) {
  return (
    <div className="relative">
      <input
        type="number"
        step={step}
        min={min}
        className={`${inputCls} pr-12 font-mono tabular-nums`}
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (!isNaN(v) && v >= min) onChange(v);
        }}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">
          {suffix}
        </span>
      )}
    </div>
  );
}

function ResultCard({
  title,
  monthly,
  perM,
  highlight,
  note,
}: {
  title: string;
  monthly: number;
  perM: number;
  highlight?: boolean;
  note: string;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight
          ? "border-teal-300 bg-teal-50/60"
          : "border-stone-200 bg-white"
      }`}
    >
      <p className="text-[11px] font-medium text-stone-400">{title}</p>
      <p className="mt-1 font-mono text-xl font-bold tabular-nums text-stone-900">
        {usd(monthly)}
      </p>
      <p className="text-xs tabular-nums text-stone-400">
        {cny(monthly)} / 月
      </p>
      <p className="mt-2 text-xs tabular-nums text-stone-600">
        折合 {usd(perM)} / 百万 tokens
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-stone-400">{note}</p>
    </div>
  );
}

export function DeepInferCost() {
  // 需求侧
  const [dailyTokens, setDailyTokens] = useState(1e9);
  const [inputPct, setInputPct] = useState(80);

  // 方案 A：官方 API（示例价，可按官方价格页修改）
  const [apiIn, setApiIn] = useState(0.28);
  const [apiOut, setApiOut] = useState(0.42);

  // 方案 B：自托管（DeepInfer）
  const [gpuPrice, setGpuPrice] = useState(5); // $/卡/小时
  const [gpuTps, setGpuTps] = useState(5000); // 单卡有效吞吐 tokens/s
  const [util, setUtil] = useState(60); // 利用率 %
  const [ops, setOps] = useState(15); // 运维加成 %

  const r = useMemo(() => {
    const inT = (dailyTokens * inputPct) / 100;
    const outT = dailyTokens - inT;

    const apiMonthly = (inT / 1e6) * apiIn * 30 + (outT / 1e6) * apiOut * 30;
    const apiPerM =
      (inputPct / 100) * apiIn + (1 - inputPct / 100) * apiOut;

    const perGpuDaily = gpuTps * 86400 * (util / 100);
    const gpus =
      perGpuDaily > 0 && dailyTokens > 0
        ? Math.max(1, Math.ceil(dailyTokens / perGpuDaily))
        : 0;
    const selfMonthly =
      gpus * gpuPrice * HOURS_PER_MONTH * (1 + ops / 100);
    const selfPerM =
      dailyTokens > 0 ? selfMonthly / ((dailyTokens * 30) / 1e6) : 0;

    // 打平 API 单价所需的单卡有效吞吐
    const gpuDailyCost = gpuPrice * 24 * (1 + ops / 100);
    const apiPerToken = apiPerM / 1e6;
    const reqTps = apiPerToken > 0 ? gpuDailyCost / apiPerToken / 86400 : 0;

    return {
      apiMonthly,
      apiPerM,
      selfMonthly,
      selfPerM,
      gpus,
      perGpuDaily,
      reqTps,
      selfWins: selfPerM > 0 && selfPerM < apiPerM,
      saving:
        apiMonthly > 0
          ? Math.abs(1 - Math.min(apiMonthly, selfMonthly) / Math.max(apiMonthly, selfMonthly))
          : 0,
    };
  }, [dailyTokens, inputPct, apiIn, apiOut, gpuPrice, gpuTps, util, ops]);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* 用量规模 */}
      <Panel title="你的用量规模">
        <div className="space-y-4">
          <Field label="日均处理 tokens">
            <NumInput
              value={dailyTokens}
              onChange={setDailyTokens}
              suffix="tokens/日"
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            {SCALE_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setDailyTokens(p.value)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  dailyTokens === p.value
                    ? "bg-teal-600 text-white shadow-sm"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <Slider
            label="输入 tokens 占比"
            value={inputPct}
            min={10}
            max={95}
            suffix="%"
            onChange={setInputPct}
          />
          <p className="text-[11px] text-stone-400">
            当前规模：每天 {compactTokens(dailyTokens)} tokens（月约{" "}
            {compactTokens(dailyTokens * 30)}），输入:输出 = {inputPct}:
            {100 - inputPct}
          </p>
        </div>
      </Panel>

      {/* 方案对比 */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* 方案 A */}
        <Panel title="方案 A · 官方 API">
          <div className="space-y-3">
            <Field label="输入单价">
              <NumInput value={apiIn} onChange={setApiIn} step={0.01} suffix="$/M" />
            </Field>
            <Field label="输出单价">
              <NumInput value={apiOut} onChange={setApiOut} step={0.01} suffix="$/M" />
            </Field>
            <p className="text-[11px] leading-relaxed text-stone-400">
              默认为示例价，请以 DeepSeek 官方价格页为准；缓存命中会更低。
            </p>
          </div>
        </Panel>

        {/* 方案 B */}
        <Panel title="方案 B · 自托管（DeepInfer / vLLM）">
          <div className="space-y-3">
            <Field label="GPU 租金">
              <NumInput value={gpuPrice} onChange={setGpuPrice} step={0.5} suffix="$/卡·时" />
            </Field>
            <Field label="单卡有效吞吐（含批处理）">
              <NumInput value={gpuTps} onChange={setGpuTps} step={100} suffix="tokens/s" />
            </Field>
            <Slider label="集群利用率" value={util} min={10} max={95} suffix="%" onChange={setUtil} />
            <Slider label="运维加成（人力/网络/存储）" value={ops} min={0} max={100} step={5} suffix="%" onChange={setOps} />
          </div>
        </Panel>
      </div>

      {/* 结果 */}
      <Panel>
        <div className="grid gap-3 sm:grid-cols-2">
          <ResultCard
            title="方案 A · 官方 API / 月"
            monthly={r.apiMonthly}
            perM={r.apiPerM}
            highlight={!r.selfWins}
            note="零运维、弹性扩缩，适合起步与流量不稳定阶段"
          />
          <ResultCard
            title={`方案 B · 自托管 / 月（约 ${r.gpus} 张卡）`}
            monthly={r.selfMonthly}
            perM={r.selfPerM}
            highlight={r.selfWins}
            note={`按单卡 ${compactTokens(Math.round(r.perGpuDaily))} tokens/日 × ${r.gpus} 卡估算`}
          />
        </div>

        <div
          className={`mt-4 rounded-xl px-4 py-3.5 text-sm font-medium leading-relaxed ${
            r.selfWins
              ? "bg-teal-50 text-teal-800"
              : "bg-stone-50 text-stone-700"
          }`}
        >
          {dailyTokens <= 0 ? (
            "请先填写日均 tokens 用量"
          ) : r.selfWins ? (
            <>
              <Server className="mr-1.5 inline h-4 w-4" />
              这个量级下自托管更省约 {(r.saving * 100).toFixed(0)}%，但注意
              DeepInfer 目前仅支持离线批量推理 + NVIDIA SM100 / 昇腾 950，在线服务还需自建 KV Cache 与负载均衡。
            </>
          ) : (
            <>
              <ArrowRight className="mr-1.5 inline h-4 w-4" />
              这个量级下直接调 API 更划算（省约 {(r.saving * 100).toFixed(0)}
              %）。要打平 API 单价，单卡有效吞吐需达到{" "}
              <span className="font-mono tabular-nums">
                {Math.round(r.reqTps).toLocaleString()}
              </span>{" "}
              tokens/s（当前设定 {gpuTps.toLocaleString()}）。
            </>
          )}
        </div>
      </Panel>

      <p className="text-center text-xs leading-relaxed text-stone-400">
        纯静态估算模型：自托管成本 = GPU 租金 × 卡数 × 720h × (1 + 运维加成)，
        未含缓存命中折扣、模型权重存储与冷启动。所有价格均可修改，决策前请以官方报价实测压测为准。
      </p>
    </div>
  );
}
