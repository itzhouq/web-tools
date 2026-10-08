import type { Metadata } from "next";
import { ToolShell } from "@/components/ToolShell";
import { RmbUppercase } from "@/components/tools/rmb-uppercase";

export const metadata: Metadata = {
  title: "人民币大写",
  description: "输入小写金额，转换为规范的人民币大写金额并一键复制。",
};

export default function Page() {
  return (
    <ToolShell slug="rmb-uppercase">
      <RmbUppercase />
    </ToolShell>
  );
}
