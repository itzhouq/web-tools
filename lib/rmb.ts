/**
 * 人民币小写金额 → 规范大写（支持到千亿级，两位小数）。
 */
const DIGITS = "零壹贰叁肆伍陆柒捌玖";
const SECTIONS = ["", "万", "亿"];

/** 0-9999 → 大写（不含节单位） */
function groupWords(n: number): string {
  const q = Math.floor(n / 1000) % 10;
  const b = Math.floor(n / 100) % 10;
  const s = Math.floor(n / 10) % 10;
  const g = n % 10;
  const parts: string[] = [];
  let zero = false;
  if (q > 0) parts.push(DIGITS[q] + "仟");
  else zero = true;
  if (b > 0) {
    if (zero && parts.length) parts.push("零");
    zero = false;
    parts.push(DIGITS[b] + "佰");
  } else if (parts.length) zero = true;
  if (s > 0) {
    if (zero && parts.length) parts.push("零");
    zero = false;
    parts.push(DIGITS[s] + "拾");
  } else if (parts.length) zero = true;
  if (g > 0) {
    if (zero && parts.length) parts.push("零");
    parts.push(DIGITS[g]);
  }
  return parts.join("");
}

/** 整数部分 → 大写 */
export function yuanToWords(yuanDigits: string): string {
  const trimmed = yuanDigits.replace(/^0+(?=\d)/, "");
  if (trimmed === "0") return "零";
  const groups: number[] = [];
  for (let end = trimmed.length; end > 0; end -= 4) {
    const start = Math.max(0, end - 4);
    groups.unshift(parseInt(trimmed.slice(start, end), 10));
  }
  let out = "";
  let zeroPending = false;
  for (let i = 0; i < groups.length; i++) {
    const idx = groups.length - 1 - i; // 从最高组开始
    const n = groups[i];
    if (n === 0) {
      if (out) zeroPending = true;
      continue;
    }
    const w = groupWords(n);
    if (zeroPending && out) {
      out += "零";
      zeroPending = false;
    } else if (out && n < 1000) {
      out += "零";
    }
    out += w + (SECTIONS[idx] ?? "");
  }
  return out || "零";
}

/** 金额字符串（最多两位小数）→ 人民币大写；非法返回 null */
export function toRMBUppercase(input: string): string | null {
  const s = input.trim().replace(/[,，\s]/g, "").replace(/^¥/, "");
  if (!s) return null;
  if (!/^-?\d{1,12}(\.\d{1,2})?$/.test(s)) return null;
  const neg = s.startsWith("-");
  const body = s.replace(/^-/, "");
  const [yuanStr, decStr = ""] = body.split(".");
  const fenStr = (decStr + "00").slice(0, 2);
  const jiao = parseInt(fenStr[0], 10);
  const fen = parseInt(fenStr[1], 10);
  const yuanNum = parseInt(yuanStr.replace(/^0+(?=\d)/, ""), 10) || 0;

  let out = neg ? "负" : "";
  const hasYuan = yuanNum > 0;
  if (hasYuan) out += yuanToWords(yuanStr) + "元";

  if (jiao === 0 && fen === 0) {
    out += hasYuan ? "整" : "整"; // 零元整 / X元整
    if (!hasYuan) out = (neg ? "负" : "") + "零元整";
    return out;
  }

  if (hasYuan && jiao === 0 && fen > 0) out += "零";
  if (jiao > 0) out += DIGITS[jiao] + "角";
  if (fen > 0) out += DIGITS[fen] + "分";
  else out += "整";
  return out;
}

/** 千分位格式化展示用 */
export function withCommas(s: string): string {
  const neg = s.startsWith("-");
  const body = s.replace(/^-/, "");
  const [int, dec] = body.split(".");
  const pretty = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (neg ? "-" : "") + pretty + (dec !== undefined ? "." + dec : "");
}
