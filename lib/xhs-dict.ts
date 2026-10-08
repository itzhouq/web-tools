/**
 * 小红书 / 内容平台常见高风险词内置词典（纯前端本地匹配，不上传文案）。
 * 分类：limit 极限词 | authority 权威背书 | medical 医疗功效 | divert 导流词 | induce 互动诱导 | other 其他风险
 */

export interface WordRule {
  word: string;
  category: RuleCategory;
  /** 修改建议 */
  advice: string;
}

export type RuleCategory =
  | "limit"
  | "authority"
  | "medical"
  | "divert"
  | "induce"
  | "other";

export const CATEGORY_INFO: Record<
  RuleCategory,
  { label: string; color: string; bg: string; desc: string }
> = {
  limit: {
    label: "极限词",
    color: "#dc2626",
    bg: "#fee2e2",
    desc: "《广告法》明令禁止的绝对化用语，风险最高",
  },
  authority: {
    label: "权威背书",
    color: "#d97706",
    bg: "#fef3c7",
    desc: "暗示国家背书或权威认证的表达，容易违规",
  },
  medical: {
    label: "医疗功效",
    color: "#9333ea",
    bg: "#f3e8ff",
    desc: "普通商品宣称治疗/功效属于夸大宣传",
  },
  divert: {
    label: "导流词",
    color: "#0891b2",
    bg: "#cffafe",
    desc: "站外引流词汇，是平台重点打击对象",
  },
  induce: {
    label: "互动诱导",
    color: "#4f46e5",
    bg: "#e0e7ff",
    desc: "诱导点赞、关注、私信等互动行为",
  },
  other: {
    label: "其他风险",
    color: "#64748b",
    bg: "#f1f5f9",
    desc: "其他常见敏感表达，建议酌情替换",
  },
};

export const WORD_RULES: WordRule[] = [
  // ---------- 极限词 ----------
  { word: "最好", category: "limit", advice: "改为「很好」「十分好用」" },
  { word: "最佳", category: "limit", advice: "改为「不错的选择」" },
  { word: "最优", category: "limit", advice: "改为「口碑不错」" },
  { word: "最全", category: "limit", advice: "改为「内容比较全」" },
  { word: "最强", category: "limit", advice: "改为「表现亮眼」" },
  { word: "最高级", category: "limit", advice: "改为「质感出色」" },
  { word: "最便宜", category: "limit", advice: "改为「性价比高」" },
  { word: "最先进", category: "limit", advice: "改为「新升级」" },
  { word: "第一", category: "limit", advice: "无权威数据支撑时删除排名表述" },
  { word: "唯一", category: "limit", advice: "改为「少见的」" },
  { word: "首个", category: "limit", advice: "改为「较早推出的」" },
  { word: "首款", category: "limit", advice: "改为「新推出的」" },
  { word: "顶级", category: "limit", advice: "改为「高端」" },
  { word: "极品", category: "limit", advice: "改为「品质出色」" },
  { word: "绝无仅有", category: "limit", advice: "改为「很少见」" },
  { word: "史无前例", category: "limit", advice: "改为「比较少见」" },
  { word: "万能", category: "limit", advice: "改为「用途广泛」" },
  { word: "完美", category: "limit", advice: "改为「表现出色」" },
  { word: "绝对", category: "limit", advice: "改为「大概率」「基本」" },
  { word: "百分之百", category: "limit", advice: "改为「绝大多数情况」" },
  { word: "国家级", category: "limit", advice: "删除，除非有官方认证文件" },
  { word: "世界级", category: "limit", advice: "改为「国际水准（需依据）」" },
  { word: "全网最低", category: "limit", advice: "改为「最近入手价不错」" },
  { word: "全网最全", category: "limit", advice: "改为「整理得比较全」" },
  { word: "销量冠军", category: "limit", advice: "需权威数据支撑，建议删除" },
  { word: "no.1", category: "limit", advice: "无权威数据支撑时删除排名表述" },
  { word: "top1", category: "limit", advice: "无权威数据支撑时删除排名表述" },
  { word: "无敌", category: "limit", advice: "改为「非常好用」" },
  { word: "史上最", category: "limit", advice: "删除绝对化表述" },

  // ---------- 权威背书 ----------
  { word: "国家认证", category: "authority", advice: "需官方认证文件，建议删除" },
  { word: "专家推荐", category: "authority", advice: "需可查证的推荐来源" },
  { word: "医生推荐", category: "authority", advice: "医疗相关背书高风险，建议删除" },
  { word: "权威认证", category: "authority", advice: "注明具体认证机构与证书" },
  { word: "官方指定", category: "authority", advice: "需官方授权，建议删除" },
  { word: "质量免检", category: "authority", advice: "我国已取消免检制度，删除" },
  { word: "专利产品", category: "authority", advice: "需注明专利号，否则删除" },

  // ---------- 医疗功效 ----------
  { word: "根治", category: "medical", advice: "改为「日常护理」等温和表述" },
  { word: "治愈", category: "medical", advice: "普通产品不可宣称治愈" },
  { word: "药到病除", category: "medical", advice: "删除医疗效果宣称" },
  { word: "消炎", category: "medical", advice: "改为「舒缓」" },
  { word: "杀菌", category: "medical", advice: "改为「清洁」" },
  { word: "祛疤", category: "medical", advice: "改为「改善肌肤外观（温和表述）」" },
  { word: "瘦身", category: "medical", advice: "改为「体态管理」" },
  { word: "减肥", category: "medical", advice: "改为「体重管理」" },
  { word: "美白", category: "medical", advice: "特殊化妆品资质需备案，谨慎使用" },
  { word: "生发", category: "medical", advice: "改为「头皮护理」" },
  { word: "抗衰老", category: "medical", advice: "改为「紧致呵护」等温和表述" },
  { word: "延年益寿", category: "medical", advice: "删除健康功效宣称" },
  { word: "降血压", category: "medical", advice: "普通食品不可宣称，删除" },
  { word: "降血糖", category: "medical", advice: "普通食品不可宣称，删除" },
  { word: "提高免疫力", category: "medical", advice: "改为「日常营养补充」" },
  { word: "助眠", category: "medical", advice: "改为「放松舒缓」" },

  // ---------- 导流词 ----------
  { word: "加微信", category: "divert", advice: "删除，改为「评论区交流」" },
  { word: "加v", category: "divert", advice: "删除站外联系方式" },
  { word: "加V", category: "divert", advice: "删除站外联系方式" },
  { word: "vx", category: "divert", advice: "删除站外联系方式" },
  { word: "VX", category: "divert", advice: "删除站外联系方式" },
  { word: "威信", category: "divert", advice: "变体导流词，删除" },
  { word: "私信我", category: "divert", advice: "改为「评论区聊聊」" },
  { word: "私聊", category: "divert", advice: "改为「评论区聊聊」" },
  { word: "滴我", category: "divert", advice: "改为「评论区留言」" },
  { word: "加群", category: "divert", advice: "删除社群引导" },
  { word: "扫码", category: "divert", advice: "删除二维码引导" },
  { word: "链接在", category: "divert", advice: "避免站外链接引导" },
  { word: "淘宝搜", category: "divert", advice: "删除其他平台引导" },
  { word: "抖音搜", category: "divert", advice: "删除其他平台引导" },
  { word: "代购", category: "divert", advice: "平台对代购内容有限制，谨慎" },
  { word: "低价出", category: "divert", advice: "疑似交易导流，谨慎" },
  { word: "有需要的联系", category: "divert", advice: "改为「感兴趣可以交流」" },

  // ---------- 互动诱导 ----------
  { word: "点赞收藏", category: "induce", advice: "改为「希望对你有帮助」" },
  { word: "求点赞", category: "induce", advice: "删除直接索要点赞" },
  { word: "求关注", category: "induce", advice: "改为「我会持续更新」" },
  { word: "关注我", category: "induce", advice: "改为「主页有更多内容」" },
  { word: "评论区扣", category: "induce", advice: "改为「欢迎评论交流」" },
  { word: "扣1", category: "induce", advice: "改为「有需要可以留言」" },
  { word: "扣一", category: "induce", advice: "改为「有需要可以留言」" },
  { word: "转发", category: "induce", advice: "删除转发诱导" },
  { word: "抽奖", category: "induce", advice: "平台抽奖有专门规则，慎用" },
  { word: "评论抽奖", category: "induce", advice: "平台抽奖有专门规则，慎用" },

  // ---------- 其他风险 ----------
  { word: "秒杀", category: "other", advice: "促销词，配合真实活动使用" },
  { word: "疯抢", category: "other", advice: "改为「最近很受欢迎」" },
  { word: "断货", category: "other", advice: "改为「比较热销」" },
  { word: "清仓", category: "other", advice: "促销表述，需真实依据" },
  { word: "跳楼价", category: "other", advice: "夸张促销词，建议删除" },
  { word: "白菜价", category: "other", advice: "改为「价格实惠」" },
  { word: "免费送", category: "other", advice: "涉及赠送活动需符合平台规则" },
  { word: "赚钱", category: "other", advice: "改为「副业探索」，避免收益承诺" },
  { word: "躺赚", category: "other", advice: "高风险收益承诺，建议删除" },
  { word: "月入过万", category: "other", advice: "收益承诺高风险，建议删除" },
  { word: "零风险", category: "other", advice: "删除风险承诺" },
  { word: "保本", category: "other", advice: "金融风险承诺，删除" },
  { word: "稳赚", category: "other", advice: "金融风险承诺，删除" },
];

export interface MatchResult {
  word: string;
  category: RuleCategory;
  advice: string;
  index: number;
  length: number;
}

/** 扫描文本，返回全部命中（按出现位置排序） */
export function scanText(text: string): MatchResult[] {
  const results: MatchResult[] = [];
  const lower = text.toLowerCase();
  for (const rule of WORD_RULES) {
    const needle = rule.word.toLowerCase();
    let from = 0;
    for (;;) {
      const idx = lower.indexOf(needle, from);
      if (idx === -1) break;
      results.push({
        word: rule.word,
        category: rule.category,
        advice: rule.advice,
        index: idx,
        length: rule.word.length,
      });
      from = idx + needle.length;
    }
  }
  return results.sort((a, b) => a.index - b.index);
}
