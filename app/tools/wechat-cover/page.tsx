import type { Metadata } from "next";
import { ToolShell } from "@/components/ToolShell";
import { WechatCover } from "@/components/tools/wechat-cover";

export const metadata: Metadata = {
  title: "公众号封面",
  description: "输入标题生成 2.35:1 微信公众号首图，支持次图与小红书尺寸，3x 高清导出。",
};

export default function Page() {
  return (
    <ToolShell slug="wechat-cover">
      <WechatCover />
    </ToolShell>
  );
}
