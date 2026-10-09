import type { Metadata } from "next";
import { ToolShell } from "@/components/ToolShell";
import { GifGenerator } from "@/components/tools/gif-generator";

export const metadata: Metadata = {
  title: "GIF 合成",
  description: "将多张图片按顺序合成动图，可调帧间隔与尺寸，实时预览。",
};

export default function Page() {
  return (
    <ToolShell slug="gif-generator">
      <GifGenerator />
    </ToolShell>
  );
}
