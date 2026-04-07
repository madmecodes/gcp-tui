import React, { useState, useCallback } from "react";
import { Box, Text, useInput } from "ink";
import { LoadingBox } from "../components/loading-box.js";
import { ErrorBox } from "../components/error-box.js";
import { Sparkline } from "../components/sparkline.js";
import { KeyHint } from "../components/key-hint.js";
import { useGcloudData } from "../hooks/use-gcloud-data.js";
import { fetchVMs } from "../data/vms.js";
import { fetchAllVMMetrics } from "../data/monitoring.js";
import type { VMMetrics, GcloudConfig } from "../types/index.js";

interface MetricsScreenProps {
  active: boolean;
  config: GcloudConfig | null;
}

function ProgressBar({ value, width = 20, color = "cyan" }: { value: number; width?: number; color?: string }) {
  const filled = Math.round(value * width);
  const empty = width - filled;
  return (
    <Text>
      <Text color={color}>{"█".repeat(filled)}</Text>
      <Text dimColor>{"░".repeat(empty)}</Text>
      <Text> {(value * 100).toFixed(1)}%</Text>
    </Text>
  );
}

export function MetricsScreen({ active, config }: MetricsScreenProps) {
  const [metricsError, setMetricsError] = useState<string | null>(null);

  const fetchMetricsData = useCallback(async (): Promise<VMMetrics[]> => {
    if (!config?.project) throw new Error("No project configured");
    const vms = await fetchVMs();
    const runningVMs = vms.filter((vm) => vm.status === "RUNNING");
    if (runningVMs.length === 0) return [];

    try {
      return await fetchAllVMMetrics(
        config.project,
        runningVMs.map((vm) => vm.name),
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("not available") || msg.includes("PERMISSION_DENIED")) {
        setMetricsError("Cloud Monitoring API is not enabled or accessible for this project.");
        return [];
      }
      throw err;
    }
  }, [config?.project]);

  const { data, loading, error, refresh } = useGcloudData(fetchMetricsData, 60_000);

  useInput(
    (input) => {
      if (input === "r") refresh();
    },
    { isActive: active },
  );

  if (loading && !data) return <LoadingBox message="Loading metrics..." />;
  if (error) return <ErrorBox message={error} />;
  if (metricsError) {
    return (
      <Box flexDirection="column" paddingX={2} paddingY={1}>
        <Text color="yellow" bold>Monitoring Unavailable</Text>
        <Text color="yellow">{metricsError}</Text>
        <Text dimColor>Enable the Cloud Monitoring API in your GCP project to see metrics.</Text>
      </Box>
    );
  }
  if (!data || data.length === 0) {
    return (
      <Box paddingX={2} paddingY={1}>
        <Text dimColor>No running VMs to show metrics for.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1} gap={1}>
      <Text bold>VM Metrics (last hour)</Text>
      {data.map((vm) => (
        <Box key={vm.vmName} flexDirection="column" marginBottom={1}>
          <Text bold color="cyan">{vm.vmName}</Text>
          <Box gap={2} marginLeft={2}>
            <Box flexDirection="column" width={40}>
              <Text dimColor>CPU</Text>
              <ProgressBar value={vm.currentCpu} color="green" />
              <Sparkline data={vm.cpu.map((d) => d.value)} width={30} color="green" />
            </Box>
            <Box flexDirection="column" width={40}>
              <Text dimColor>Network In</Text>
              <Sparkline data={vm.networkIn.map((d) => d.value)} width={30} color="blue" />
            </Box>
            <Box flexDirection="column" width={40}>
              <Text dimColor>Network Out</Text>
              <Sparkline data={vm.networkOut.map((d) => d.value)} width={30} color="magenta" />
            </Box>
          </Box>
        </Box>
      ))}
      <KeyHint hints={[{ key: "r", label: "refresh" }]} />
    </Box>
  );
}
