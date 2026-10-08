import type { Metadata } from "next";
import { ToolShell } from "@/components/ToolShell";
import { ImageWatermark } from "@/components/tools/image-watermark";

export const metadata: Metadata = {
  title: "图片水印",
  description: "给图片加文字水印，支持九宫格位置、平铺、透明度与旋转。",
};

export default function Page() {
  return (
    <ToolShell slug="image-watermark">
      <ImageWatermark />
    </ToolShell>
  );
}
