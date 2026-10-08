import type { Metadata } from "next";
import { ToolShell } from "@/components/ToolShell";
import { JwtDecoder } from "@/components/tools/jwt-decoder";

export const metadata: Metadata = {
  title: "Token 解析",
  description: "解码 JWT 的 Header 与 Payload，自动解读过期时间与签名信息。",
};

export default function Page() {
  return (
    <ToolShell slug="jwt-decoder">
      <JwtDecoder />
    </ToolShell>
  );
}
