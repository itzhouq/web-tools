import type { Metadata } from "next";
import { ToolShell } from "@/components/ToolShell";
import { QrCodeTool } from "@/components/tools/qr-code";

export const metadata: Metadata = {
  title: "二维码生成",
  description: "输入网址或文本生成二维码，支持自定义配色与中央 Logo。",
};

export default function Page() {
  return (
    <ToolShell slug="qr-code">
      <QrCodeTool />
    </ToolShell>
  );
}
