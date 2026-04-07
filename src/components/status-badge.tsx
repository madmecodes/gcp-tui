import React from "react";
import { Text } from "ink";
import { statusColor } from "../utils/colors.js";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const color = statusColor(status);
  const dot = status === "RUNNING" ? "●" : status === "TERMINATED" || status === "STOPPED" ? "○" : "◌";
  return (
    <Text color={color}>{dot} {status}</Text>
  );
}
