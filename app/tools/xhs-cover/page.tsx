import type { Metadata } from "next";
import { ToolShell } from "@/components/ToolShell";
import { XhsCover } from "@/components/tools/xhs-cover";

export const metadata: Metadata = {
  title: "小红书封面",
  description: "套用精选模板，输入标题即可生成 3:4 高清封面图。",
};

export default function Page() {
  return (
    <ToolShell slug="xhs-cover">
      <XhsCover />
    </ToolShell>
  );
}
