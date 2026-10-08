"use client";

import {
  Braces,
  Clock,
  Crop,
  ImageDown,
  JapaneseYen,
  KeyRound,
  LetterText as ImageText,
  Palette,
  PenLine,
  QrCode,
  ShieldAlert,
  Stamp,
  Terminal,
  Type,
  Image as ImageIcon,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  ImageDown,
  ImageText,
  Palette,
  ShieldAlert,
  Braces,
  KeyRound,
  Clock,
  QrCode,
  Image: ImageIcon,
  PenLine,
  Terminal,
  Type,
  Crop,
  Stamp,
  JapaneseYen,
};

export function ToolIcon({
  name,
  bg,
  fg,
  size = 40,
  radius = 12,
}: {
  name: string;
  bg: string;
  fg: string;
  size?: number;
  radius?: number;
}) {
  const Icon = ICONS[name] ?? ImageIcon;
  return (
    <span
      className="flex shrink-0 items-center justify-center"
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        color: fg,
        borderRadius: radius,
      }}
    >
      <Icon style={{ width: size * 0.5, height: size * 0.5 }} strokeWidth={2} />
    </span>
  );
}
