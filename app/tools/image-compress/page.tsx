import type { Metadata } from "next";
import { ToolShell } from "@/components/ToolShell";
import { ImageCompress } from "@/components/tools/image-compress";

export const metadata: Metadata = {
  title: "图片压缩",
  description: "在浏览器本地压缩图片体积，支持质量、格式与尺寸调整，不上传任何数据。",
};

export default function Page() {
  return (
    <ToolShell slug="image-compress">
      <ImageCompress />
    </ToolShell>
  );
}
