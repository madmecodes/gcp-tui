import React from "react";
import { Text } from "ink";

const BARS = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];

interface SparklineProps {
  data: number[];
  width?: number;
  color?: string;
}

export function Sparkline({ data, width = 20, color = "cyan" }: SparklineProps) {
  if (data.length === 0) {
    return <Text dimColor>{"▁".repeat(width)}</Text>;
  }

  const values = data.slice(-width);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const chars = values.map((v) => {
    const normalized = (v - min) / range;
    const idx = Math.round(normalized * (BARS.length - 1));
    return BARS[Math.min(idx, BARS.length - 1)];
  });

  // Pad to width
  while (chars.length < width) {
    chars.unshift(BARS[0]);
  }

  return <Text color={color}>{chars.join("")}</Text>;
}
