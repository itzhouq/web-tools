/**
 * 主域名子路径分流 Worker
 * 路由：itzhouq.cn/tools*
 *
 * 规则：
 * - /tools/_next/*、8 个工具页 → 工具站（web-tools-subpath.pages.dev）
 * - /tools/（博客原生工具卡片页，内嵌工具箱 iframe）→ 原样回源博客
 * - 其余 /tools/*（如博客的 /tools/chat）→ 原样回源博客，互不影响
 */
const TOOLS_ORIGIN = "https://web-tools-subpath.pages.dev";
const SLUGS = new Set([
  "image-compress",
  "image-crop",
  "image-watermark",
  "gif-generator",
  "long-image-slicer",
  "text-to-image",
  "xhs-cover",
  "xhs-words",
  "chinese-converter",
  "rmb-uppercase",
  "json-format",
  "jwt-decoder",
  "timestamp",
  "qr-code",
]);

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const p = url.pathname;
    const seg = p.split("/").filter(Boolean)[1]; // "/tools/<seg>/..." 的 <seg>

    const isAssets = p.startsWith("/tools/_next/");
    const isSlug =
      seg &&
      SLUGS.has(seg) &&
      (p === `/tools/${seg}` || p.startsWith(`/tools/${seg}/`));

    if (isAssets || isSlug) {
      return fetch(`${TOOLS_ORIGIN}${p}${url.search}`, request);
    }
    return fetch(request);
  },
};
