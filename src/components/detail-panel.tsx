import React from "react";
import { Box, Text } from "ink";
import { formatCurrency, formatRate } from "../utils/format.js";
import { getSSHCommand } from "../actions/vm-actions.js";
import type { VMRow } from "../types/index.js";

interface DetailPanelProps {
  vm: VMRow;
}

export function DetailPanel({ vm }: DetailPanelProps) {
  const costSoFar = vm.hourlyRate * vm.uptimeHours;
  const sshCmd = getSSHCommand(vm.name, vm.zone);

  return (
    <Box
      flexDirection="column"
      borderStyle="single"
      borderColor="cyan"
      paddingX={2}
      paddingY={1}
    >
      <Text bold color="cyan">{vm.name}</Text>
      <Box marginTop={1} gap={4}>
        <Box flexDirection="column">
          <Text dimColor>Status</Text>
          <Text bold>{vm.status}</Text>
        </Box>
        <Box flexDirection="column">
          <Text dimColor>Zone</Text>
          <Text>{vm.zone}</Text>
        </Box>
        <Box flexDirection="column">
          <Text dimColor>Type</Text>
          <Text>{vm.machineType}</Text>
        </Box>
        <Box flexDirection="column">
          <Text dimColor>vCPUs</Text>
          <Text>{vm.vCPUs}</Text>
        </Box>
        <Box flexDirection="column">
          <Text dimColor>RAM</Text>
          <Text>{vm.memoryGB} GB</Text>
        </Box>
        <Box flexDirection="column">
          <Text dimColor>Disk</Text>
          <Text>{vm.diskGB > 0 ? `${vm.diskGB} GB` : "-"}</Text>
        </Box>
      </Box>
      <Box marginTop={1} gap={4}>
        <Box flexDirection="column">
          <Text dimColor>Internal IP</Text>
          <Text>{vm.internalIP}</Text>
        </Box>
        <Box flexDirection="column">
          <Text dimColor>External IP</Text>
          <Text>{vm.externalIP}</Text>
        </Box>
        <Box flexDirection="column">
          <Text dimColor>Hourly Rate</Text>
          <Text color="yellow">{formatRate(vm.hourlyRate)}</Text>
        </Box>
        <Box flexDirection="column">
          <Text dimColor>Cost So Far</Text>
          <Text color="green">{formatCurrency(costSoFar)}</Text>
        </Box>
        <Box flexDirection="column">
          <Text dimColor>Uptime</Text>
          <Text>{vm.uptime}</Text>
        </Box>
      </Box>
      <Box marginTop={1}>
        <Text dimColor>SSH: </Text>
        <Text color="white">{sshCmd}</Text>
      </Box>
    </Box>
  );
}
