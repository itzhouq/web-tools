import type { Metadata } from "next";
import { ToolShell } from "@/components/ToolShell";
import { JsonFormat } from "@/components/tools/json-format";

export const metadata: Metadata = {
  title: "JSON 格式化",
  description: "格式化、压缩与校验 JSON，语法高亮，错误精准定位到行列。",
};

export default function Page() {
  return (
    <ToolShell slug="json-format">
      <JsonFormat />
    </ToolShell>
  );
}
