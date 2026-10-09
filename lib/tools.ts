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
    slug: "gif-generator",
    name: "GIF 合成",
    description: "将多张图片按顺序合成动图，可调帧间隔与尺寸，实时预览。",
    category: "image",
    icon: "Film",
    tint: { bg: "#ede9fe", fg: "#7c3aed" },
    keywords: ["gif", "动图", "合成", "帧动画"],
    isNew: true,
  },
  {
    slug: "long-image-slicer",
    name: "长图切片",
    description: "把长图按 3:4 智能寻找安全切线切片，避免切断内容。",
    category: "image",
    icon: "Scissors",
    tint: { bg: "#ffe4e6", fg: "#e11d48" },
    keywords: ["长图", "切片", "3:4", "分割"],
    isNew: true,
  },
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
    slug: "image-crop",
    name: "图片裁剪",
    description: "按 1:1、3:4、16:9 等常用比例裁剪图片，拖拽定位，原图分辨率导出。",
    category: "image",
    icon: "Crop",
    tint: { bg: "#e0e7ff", fg: "#4338ca" },
    keywords: ["裁剪", "crop", "比例", "九宫格"],
    isNew: true,
  },
  {
    slug: "image-watermark",
    name: "图片水印",
    description: "给图片加文字水印，支持九宫格位置、平铺、透明度与旋转。",
    category: "image",
    icon: "Stamp",
    tint: { bg: "#dbeafe", fg: "#1d4ed8" },
    keywords: ["水印", "watermark", "防盗", "签名"],
    isNew: true,
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
    slug: "wechat-cover",
    name: "公众号封面",
    description: "输入标题生成 2.35:1 公众号首图，支持次图与小红书尺寸，3x 高清导出。",
    category: "xhs",
    icon: "Newspaper",
    tint: { bg: "#e0f2fe", fg: "#0369a1" },
    keywords: ["公众号", "封面", "首图", "微信", "2.35:1"],
    isNew: true,
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
    slug: "rmb-uppercase",
    name: "人民币大写",
    description: "输入小写金额，转换为规范的人民币大写金额并一键复制。",
    category: "text",
    icon: "JapaneseYen",
    tint: { bg: "#dcfce7", fg: "#16a34a" },
    keywords: ["人民币", "大写", "金额", "发票", "财务"],
    isNew: true,
  },
  {
    slug: "chinese-converter",
    name: "简繁互转",
    description: "简体中文与繁体中文双向转换，支持大陆、台湾、香港用词习惯。",
    category: "text",
    icon: "Languages",
    tint: { bg: "#fef9c3", fg: "#a16207" },
    keywords: ["简繁", "繁体", "简体", "转换"],
    isNew: true,
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
