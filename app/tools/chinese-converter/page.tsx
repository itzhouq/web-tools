import type { Metadata } from "next";
import { ToolShell } from "@/components/ToolShell";
import { ChineseConverter } from "@/components/tools/chinese-converter";

export const metadata: Metadata = {
  title: "简繁互转",
  description: "简体中文与繁体中文双向转换，支持大陆、台湾、香港用词习惯。",
};

export default function Page() {
  return (
    <ToolShell slug="chinese-converter">
      <ChineseConverter />
    </ToolShell>
  );
}
