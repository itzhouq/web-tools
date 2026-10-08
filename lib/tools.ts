export type ToolCategory =
  | "image"
  | "xhs"
  | "dev"
  | "text";

export interface ToolMeta {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  /** lucide-react 图标名 */
  icon: string;
  /** 图标底色（浅）与前景色 */
  tint: { bg: string; fg: string };
  keywords: string[];
  isNew?: boolean;
}

export const CATEGORY_META: Record<
  ToolCategory,
  { label: string; icon: string }
> = {
  image: { label: "图片处理", icon: "Image" },
  xhs: { label: "内容创作", icon: "PenLine" },
  dev: { label: "开发辅助", icon: "Terminal" },
  text: { label: "文本效率", icon: "Type" },
};

export const TOOLS: ToolMeta[] = [
  {
    slug: "image-compress",
    name: "图片压缩",
    description: "在浏览器本地压缩图片体积，支持质量、格式与尺寸调整。",
    category: "image",
    icon: "ImageDown",
    tint: { bg: "#eef2ff", fg: "#4f46e5" },
    keywords: ["压缩", "compress", "webp", "jpeg", "图片体积"],
  },
  {
    slug: "text-to-image",
    name: "文字转图片",
    description: "把文字、段落排版成精致的长图卡片，适合分享到社交平台。",
    category: "image",
    icon: "ImageText",
    tint: { bg: "#fef3c7", fg: "#b45309" },
    keywords: ["长图", "文字图", "分享图", "金句卡片"],
  },
  {
    slug: "xhs-cover",
    name: "小红书封面",
    description: "套用精选模板，输入标题即可生成 3:4 高清封面图。",
    category: "xhs",
    icon: "Palette",
    tint: { bg: "#fce7f3", fg: "#db2777" },
    keywords: ["封面", "3:4", "小红书", "模板"],
    isNew: true,
  },
  {
    slug: "xhs-words",
    name: "违禁词检测",
    description: "检测文案中的极限词、导流词和互动诱导词，并给出修改建议。",
    category: "xhs",
    icon: "ShieldAlert",
    tint: { bg: "#fee2e2", fg: "#dc2626" },
    keywords: ["违禁词", "敏感词", "极限词", "广告法"],
    isNew: true,
  },
  {
    slug: "json-format",
    name: "JSON 格式化",
    description: "格式化、压缩与校验 JSON，语法高亮，错误精准定位到行列。",
    category: "dev",
    icon: "Braces",
    tint: { bg: "#ecfdf5", fg: "#059669" },
    keywords: ["json", "格式化", "美化", "校验"],
  },
  {
    slug: "jwt-decoder",
    name: "Token 解析",
    description: "解码 JWT 的 Header 与 Payload，自动解读过期时间与签名信息。",
    category: "dev",
    icon: "KeyRound",
    tint: { bg: "#f3e8ff", fg: "#9333ea" },
    keywords: ["jwt", "token", "解码", "鉴权"],
    isNew: true,
  },
  {
    slug: "timestamp",
    name: "时间戳转换",
    description: "本地时间与 Unix 时间戳双向转换，自动识别秒和毫秒。",
    category: "dev",
    icon: "Clock",
    tint: { bg: "#e0f2fe", fg: "#0284c7" },
    keywords: ["时间戳", "unix", "date", "转换"],
  },
  {
    slug: "qr-code",
    name: "二维码生成",
    description: "输入网址或文本生成二维码，支持自定义配色与中央 Logo。",
    category: "text",
    icon: "QrCode",
    tint: { bg: "#f1f5f9", fg: "#334155" },
    keywords: ["二维码", "qr", "扫码", "链接"],
  },
];

export function getTool(slug: string): ToolMeta | undefined {
  return TOOLS.find((t) => t.slug === slug);
}
