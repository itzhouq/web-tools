import type { Metadata } from "next";
import { ToolShell } from "@/components/ToolShell";
import { TextToImage } from "@/components/tools/text-to-image";

export const metadata: Metadata = {
  title: "文字转图片",
  description: "把文字、段落排版成精致的长图卡片，适合分享到社交平台。",
};

export default function Page() {
  return (
    <ToolShell slug="text-to-image">
      <TextToImage />
    </ToolShell>
  );
}
