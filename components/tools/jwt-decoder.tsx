"use client";

import { useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, CircleCheck } from "lucide-react";
import { CopyButton, Panel, inputCls } from "@/components/ui";

interface JwtPart {
  raw: string;
  json: string;
}

function decodePart(encoded: string): JwtPart | null {
  try {
    // base64url → base64
    let b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const json = decodeURIComponent(
      atob(b64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    // 校验是合法 JSON
    JSON.parse(json);
    return { raw: encoded, json: JSON.stringify(JSON.parse(json), null, 2) };
  } catch {
    return null;
  }
}

const CLAIM_INFO: Record<string, string> = {
  iss: "签发方",
  sub: "主体",
  aud: "受众",
  exp: "过期时间",
  nbf: "生效时间",
  iat: "签发时间",
  jti: "唯一标识",
  alg: "签名算法",
  typ: "类型",
  kid: "密钥 ID",
};

function timeClaims(json: string): { key: string; label: string; ts: number }[] {
  try {
    const obj = JSON.parse(json);
    return ["exp", "nbf", "iat"]
      .filter((k) => typeof obj[k] === "number")
      .map((k) => ({
        key: k,
        label: CLAIM_INFO[k],
        ts: obj[k] * (obj[k] > 1e12 ? 1 : 1000),
      }));
  } catch {
    return [];
  }
}

function fmtTime(ms: number) {
  return new Date(ms).toLocaleString("zh-CN", { hour12: false });
}

export function JwtDecoder() {
  const [token, setToken] = useState("");

  const parts = useMemo(
    () => (token.trim() ? token.trim().split(".") : []),
    [token]
  );

  const header = parts.length >= 2 ? decodePart(parts[0]) : null;
  const payload = parts.length >= 2 ? decodePart(parts[1]) : null;
  const signature = parts.length >= 3 ? parts[2] : null;
  const structValid = parts.length === 3 && header && payload;

  // 过期状态
  const expInfo = useMemo(() => {
    if (!payload) return null;
    try {
      const obj = JSON.parse(payload.json);
      if (typeof obj.exp !== "number") return null;
      const expMs = obj.exp * (obj.exp > 1e12 ? 1 : 1000);
      const expired = expMs < Date.now();
      return {
        expired,
        time: fmtTime(expMs),
        diff: expired
          ? `已过期 ${formatDiff(Date.now() - expMs)}`
          : `剩余 ${formatDiff(expMs - Date.now())}`,
      };
    } catch {
      return null;
    }
  }, [payload]);

  const coloredToken = useMemo(() => {
    if (!parts.length) return null;
    const colors = ["text-rose-600", "text-indigo-600", "text-cyan-600"];
    return parts.map((p, i) => (
      <span key={i} className={colors[i % 3]}>
        {p}
        {i < parts.length - 1 && <span className="text-stone-300">.</span>}
      </span>
    ));
  }, [parts]);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-4">
        <Panel title="粘贴 Token">
          <textarea
            className={`${inputCls} min-h-[140px] resize-y font-mono text-[12px] leading-6 break-all`}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.xxx"
            spellCheck={false}
          />
          {token.trim() && (
            <div className="mt-3">
              <p className="mb-1.5 text-[13px] font-medium text-stone-600">
                结构
              </p>
              <p className="break-all rounded-lg bg-stone-50 p-3 font-mono text-[11px] leading-5">
                {coloredToken}
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-stone-500">
                {structValid ? (
                  <>
                    <CircleCheck className="h-3.5 w-3.5 text-emerald-500" />
                    三段式结构完整（Header.Payload.Signature）
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    标准 JWT 应为三段式（Header.Payload.Signature）
                  </>
                )}
              </p>
            </div>
          )}
        </Panel>

        {expInfo && (
          <div
            className={`rounded-xl px-4 py-3.5 text-sm ring-1 ${
              expInfo.expired
                ? "bg-red-50 text-red-700 ring-red-200"
                : "bg-emerald-50 text-emerald-700 ring-emerald-200"
            }`}
          >
            <p className="font-semibold">
              {expInfo.expired ? "Token 已过期" : "Token 有效中"}
            </p>
            <p className="mt-0.5 text-xs opacity-90">
              过期时间 {expInfo.time} · {expInfo.diff}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <DecodePanel title="Header（头部）" part={header} />
        <DecodePanel title="Payload（载荷）" part={payload} />

        {signature && (
          <Panel title="Signature（签名）">
            <p className="break-all font-mono text-[12px] leading-6 text-stone-600">
              {signature}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-stone-400">
              签名校验需要服务端密钥，本工具只做本地解码，不会验证签名真伪。
            </p>
          </Panel>
        )}

        {!token.trim() && (
          <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-stone-300 text-sm text-stone-400">
            粘贴 Token 后自动解码，全程本地完成
          </div>
        )}
      </div>
    </div>
  );
}

function DecodePanel({ title, part }: { title: ReactNode; part: JwtPart | null }) {
  if (!part) return null;
  const times = timeClaims(part.json);
  return (
    <Panel
      title={
        <span className="flex items-center justify-between">
          {title}
          <CopyButton
            text={part.json}
            label="复制"
            className="!px-2 !py-1 text-xs"
          />
        </span>
      }
    >
      <pre className="max-h-[260px] overflow-auto rounded-lg bg-stone-50 p-4 font-mono text-[12px] leading-6 text-stone-700">
        {part.json}
      </pre>
      {times.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {times.map((t) => (
            <li
              key={t.key}
              className="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2 text-xs"
            >
              <span className="font-mono font-semibold text-stone-700">
                {t.key}
                <span className="ml-2 font-sans font-normal text-stone-400">
                  {t.label}
                </span>
              </span>
              <span className="tabular-nums text-stone-600">
                {fmtTime(t.ts)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function formatDiff(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s} 秒`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} 分钟`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小时 ${m % 60} 分钟`;
  const d = Math.floor(h / 24);
  return `${d} 天 ${h % 24} 小时`;
}
