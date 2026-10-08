import type { Metadata } from "next";
import { ToolShell } from "@/components/ToolShell";
import { ImageCrop } from "@/components/tools/image-crop";

export const metadata: Metadata = {
  title: "图片裁剪",
  description: "按 1:1、3:4、16:9 等常用比例裁剪图片，拖拽定位，原图分辨率导出。",
};

export default function Page() {
  return (
    <ToolShell slug="image-crop">
      <ImageCrop />
    </ToolShell>
  );
}
