import React from "react";
import { Box, Text } from "ink";
import { useClock } from "../hooks/use-clock.js";
import type { GcloudConfig } from "../types/index.js";

interface HeaderProps {
  config: GcloudConfig | null;
  vmCount?: number;
  diskCount?: number;
}

export function Header({ config, vmCount, diskCount }: HeaderProps) {
  const clock = useClock();

  return (
    <Box borderStyle="single" borderBottom={false} paddingX={1} justifyContent="space-between">
      <Box>
        <Text bold color="cyan">gcp-tui</Text>
        <Text>  </Text>
        {config ? (
          <>
            <Text>Project: </Text>
            <Text bold color="green">{config.project || "none"}</Text>
            <Text>  Account: </Text>
            <Text color="yellow">{config.account || "none"}</Text>
            {config.region && (
              <>
                <Text>  Region: </Text>
                <Text>{config.region}</Text>
              </>
            )}
          </>
        ) : (
          <Text dimColor>Loading config...</Text>
        )}
      </Box>
      <Box gap={2}>
        {vmCount != null && (
          <Text dimColor>{vmCount} VMs</Text>
        )}
        {diskCount != null && (
          <Text dimColor>{diskCount} disks</Text>
        )}
        <Text color="white">{clock}</Text>
      </Box>
    </Box>
  );
}
