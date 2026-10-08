"use client";

import { useMemo, useState } from "react";
import { JapaneseYen } from "lucide-react";
import { CopyButton, Panel, inputCls } from "@/components/ui";
import { toRMBUppercase, withCommas } from "@/lib/rmb";

const SAMPLES = ["16800", "1023.45", "0.05", "100000001", "2098007.5"];

export function RmbUppercase() {
  const [amount, setAmount] = useState("");

  const upper = useMemo(() => toRMBUppercase(amount), [amount]);
  const invalid = amount.trim() !== "" && upper === null;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Panel>
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-stone-600">
            <JapaneseYen className="h-4 w-4" />
            小写金额（支持逗号分隔，最多两位小数）
          </span>
          <input
            className={`${inputCls} font-mono !text-lg`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            inputMode="decimal"
            autoFocus
          />
        </label>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {SAMPLES.map((s) => (
            <button
              key={s}
              onClick={() => setAmount(s)}
              className="rounded-full bg-stone-100 px-2.5 py-1 font-mono text-xs text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-700"
            >
              {s}
            </button>
          ))}
        </div>
      </Panel>

      {invalid ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          金额格式不正确：整数部分最多 12 位，小数最多 2 位，例如 12345.67
        </div>
      ) : upper ? (
        <>
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white px-6 py-7 text-center shadow-sm">
            <p className="text-[13px] font-medium text-stone-500">
              人民币大写
            </p>
            <p className="mt-2.5 text-xl font-bold leading-relaxed tracking-wide text-emerald-800 sm:text-2xl">
              {upper}
            </p>
            <p className="mt-2 font-mono text-sm text-stone-400">
              ¥ {withCommas(amount.trim().replace(/^[+]/, "")) || "0.00"}
            </p>
            <div className="mt-4 flex justify-center">
              <CopyButton text={upper} label="复制大写金额" />
            </div>
          </div>
          <p className="text-center text-xs leading-relaxed text-stone-400">
            按《正确填写票据和结算凭证的基本规定》生成 · 适用于发票、合同、报销单据
          </p>
        </>
      ) : (
        <div className="flex min-h-[120px] items-center justify-center rounded-2xl border border-dashed border-stone-300 text-sm text-stone-400">
          输入金额后自动转换
        </div>
      )}
    </div>
  );
}
