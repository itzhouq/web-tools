import type { Metadata } from "next";
import { ToolShell } from "@/components/ToolShell";
import { TimestampTool } from "@/components/tools/timestamp";

export const metadata: Metadata = {
  title: "时间戳转换",
  description: "本地时间与 Unix 时间戳双向转换，自动识别秒和毫秒。",
};

export default function Page() {
  return (
    <ToolShell slug="timestamp">
      <TimestampTool />
    </ToolShell>
  );
}
