import type { Metadata } from "next";
import { ToolShell } from "@/components/ToolShell";
import { XhsWords } from "@/components/tools/xhs-words";

export const metadata: Metadata = {
  title: "违禁词检测",
  description: "检测文案中的极限词、导流词和互动诱导词，并给出修改建议，全程本地完成。",
};

export default function Page() {
  return (
    <ToolShell slug="xhs-words">
      <XhsWords />
    </ToolShell>
  );
}
