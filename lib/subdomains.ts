/** 工具子域名 → 工具 slug 映射（与 worker/tools-subdomains.js 保持同步） */
export const SUB_TO_SLUG: Record<string, string> = {
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

export const TOOLS_HOME = "https://tools.itzhouq.cn";

/** 当前主机名是否是某个工具子域名 */
export function isToolSubdomain(hostname: string): boolean {
  if (!hostname.endsWith(".itzhouq.cn")) return false;
  return hostname.split(".")[0] in SUB_TO_SLUG;
}
