"use client";

import { useMemo, useState } from "react";
import { ShieldAlert, ShieldCheck, Lightbulb } from "lucide-react";
import { Panel, CopyButton, inputCls } from "@/components/ui";
import {
  CATEGORY_INFO,
  scanText,
  type MatchResult,
  type RuleCategory,
} from "@/lib/xhs-dict";

const SAMPLE = `这瓶面霜真的是我用过最好的一瓶！美白效果绝了，坚持用感觉能淡化细纹。
全网最低价入手，姐妹们别犹豫，绝对值得！需要链接的私信我，或者加V详聊～
看完记得点赞收藏，评论区扣1，下期分享减肥食谱！`;

export function XhsWords() {
  const [text, setText] = useState("");

  const matches = useMemo(() => scanText(text), [text]);

  const byCategory = useMemo(() => {
    const map = new Map<RuleCategory, MatchResult[]>();
    for (const m of matches) {
      const arr = map.get(m.category) ?? [];
      arr.push(m);
      map.set(m.category, arr);
    }
    return map;
  }, [matches]);

  // 命中区间集合（用于高亮）
  const spans = useMemo(() => {
    const spans: { start: number; end: number; category: RuleCategory }[] = [];
    for (const m of matches) spans.push({ start: m.index, end: m.index + m.length, category: m.category });
    return spans;
  }, [matches]);

  const highlighted = useMemo(() => {
    if (!spans.length) return null;
    const parts: React.ReactNode[] = [];
    let cursor = 0;
    let key = 0;
    for (const s of spans) {
      if (s.start > cursor) parts.push(text.slice(cursor, s.start));
      parts.push(
        <mark
          key={key++}
          className="rounded px-0.5 font-medium"
          style={{ background: CATEGORY_INFO[s.category].bg, color: CATEGORY_INFO[s.category].color }}
        >
          {text.slice(s.start, s.end)}
        </mark>
      );
      cursor = s.end;
    }
    if (cursor < text.length) parts.push(text.slice(cursor));
    return parts;
  }, [text, spans]);

  const riskScore = matches.reduce(
    (score, m) => score + (m.category === "limit" ? 3 : m.category === "divert" ? 3 : 2),
    0
  );
  const riskLevel =
    matches.length === 0
      ? { label: "未检测到风险", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" }
      : riskScore >= 9
        ? { label: "高风险，建议大幅修改", cls: "bg-red-50 text-red-700 ring-red-200" }
        : riskScore >= 4
          ? { label: "中风险，建议修改后发布", cls: "bg-amber-50 text-amber-700 ring-amber-200" }
          : { label: "低风险，稍作调整更稳", cls: "bg-yellow-50 text-yellow-700 ring-yellow-200" };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      {/* 左：输入 + 高亮预览 */}
      <div className="space-y-4">
        <Panel
          title={
            <span className="flex items-center justify-between">
              文案输入
              <button
                className="text-xs font-normal text-indigo-600 hover:underline"
                onClick={() => setText(SAMPLE)}
              >
                填入示例文案
              </button>
            </span>
          }
        >
          <textarea
            className={`${inputCls} min-h-[160px] resize-y leading-relaxed`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="把准备发布的小红书文案粘贴到这里，检测全程在你的浏览器本地完成，不会上传。"
          />
        </Panel>

        {text && (
          <Panel title="高亮预览">
            <p className="whitespace-pre-wrap text-[15px] leading-8 text-stone-700">
              {highlighted ?? text}
            </p>
          </Panel>
        )}
      </div>

      {/* 右：结果面板 */}
      <div className="space-y-4">
        <Panel>
          <div
            className={`flex items-center gap-3 rounded-xl px-4 py-3.5 ring-1 ${riskLevel.cls}`}
          >
            {matches.length === 0 ? (
              <ShieldCheck className="h-6 w-6 shrink-0" />
            ) : (
              <ShieldAlert className="h-6 w-6 shrink-0" />
            )}
            <div>
              <p className="text-sm font-semibold">{riskLevel.label}</p>
              <p className="mt-0.5 text-xs opacity-80">
                命中 {matches.length} 处风险词
              </p>
            </div>
          </div>
        </Panel>

        {matches.length > 0 && (
          <Panel title="风险明细与修改建议">
            <div className="space-y-4">
              {(Object.keys(CATEGORY_INFO) as RuleCategory[]).map((cat) => {
                const list = byCategory.get(cat);
                if (!list) return null;
                const info = CATEGORY_INFO[cat];
                return (
                  <div key={cat}>
                    <p className="mb-2 text-[13px] font-semibold" style={{ color: info.color }}>
                      {info.label}
                      <span className="ml-1.5 font-normal text-stone-400">
                        {list.length} 处 · {info.desc}
                      </span>
                    </p>
                    <ul className="space-y-1.5">
                      {[...new Set(list.map((m) => m.word))].map((word) => {
                        const advice = list.find((m) => m.word === word)!.advice;
                        return (
                          <li
                            key={word}
                            className="flex items-start gap-2 rounded-lg bg-stone-50 px-3 py-2 text-[13px]"
                          >
                            <span
                              className="shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold"
                              style={{ background: info.bg, color: info.color }}
                            >
                              {word}
                            </span>
                            <span className="flex items-start gap-1 text-stone-600">
                              <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                              {advice}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </Panel>
        )}

        {text && (
          <CopyButton text={text} label="复制原文案" className="w-full" />
        )}
      </div>
    </div>
  );
}
