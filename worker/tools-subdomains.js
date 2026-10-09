/**
 * 工具子域名分流 Worker
 * 路由：14 个工具子域名（json.itzhouq.cn / qr.itzhouq.cn / …）
 *
 * 规则：
 * - <sub>.itzhouq.cn → 工具站对应工具页（web-tools.pages.dev/tools/<slug>/）
 * - 静态资源（/_next、favicon 等）→ 工具站根路径
 * - 未映射的子域名 → 原样回源
 */
const ORIGIN = "https://web-tools-1b4.pages.dev";

const SUB_TO_SLUG = {
  json: "json-format",
  jwt: "jwt-decoder",
  ts: "timestamp",
  qr: "qr-code",
  img: "image-compress",
  crop: "image-crop",
  mark: "image-watermark",
  gif: "gif-generator",
  slice: "long-image-slicer",
  card: "text-to-image",
  cover: "xhs-cover",
  words: "xhs-words",
  jianfan: "chinese-converter",
  rmb: "rmb-uppercase",
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const sub = url.hostname.split(".")[0];
    const slug = SUB_TO_SLUG[sub];
    if (!slug) return fetch(request); // 未映射子域 → 回源

    const p = url.pathname;
    const isAsset =
      p.startsWith("/_next/") ||
      p === "/favicon.ico" ||
      p === "/robots.txt" ||
      p === "/sitemap.xml" ||
      p.startsWith("/icon") ||
      p.startsWith("/apple");

    const upstreamPath = isAsset ? p : `/tools/${slug}${p === "/" ? "/" : p}`;
    return fetch(`${ORIGIN}${upstreamPath}${url.search}`, request);
  },
};
