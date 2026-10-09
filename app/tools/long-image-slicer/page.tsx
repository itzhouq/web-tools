import type { Metadata } from "next";
import { ToolShell } from "@/components/ToolShell";
import { LongImageSlicer } from "@/components/tools/long-image-slicer";

export const metadata: Metadata = {
  title: "长图切片",
  description: "把长图按 3:4 智能寻找安全切线切片，避免切断内容。",
};

export default function Page() {
  return (
    <ToolShell slug="long-image-slicer">
      <LongImageSlicer />
    </ToolShell>
  );
}
