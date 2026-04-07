import React from "react";
import { Box, Text, useInput } from "ink";
import { LoadingBox } from "../components/loading-box.js";
import { ErrorBox } from "../components/error-box.js";
import { Sparkline } from "../components/sparkline.js";
import { useGcloudData } from "../hooks/use-gcloud-data.js";
import { fetchCostEstimate, fetchPerServerCosts } from "../data/billing.js";
import { formatCurrency, truncate } from "../utils/format.js";
import type { VMCostRow } from "../types/index.js";

function costColor(amount: number): string {
  if (amount > 50) return "red";
  if (amount > 10) return "yellow";
  return "green";
}

interface CostsScreenProps {
  active: boolean;
  contentHeight?: number;
  terminalWidth?: number;
}

export function CostsScreen({ active, contentHeight }: CostsScreenProps) {
  const { data, loading, error, refresh } = useGcloudData(fetchCostEstimate, 60_000);
  const { data: serverCosts, loading: serverLoading } = useGcloudData(fetchPerServerCosts, 60_000);

  useInput(
    (input) => {
      if (input === "r") refresh();
    },
    { isActive: active },
  );

  if (loading && !data) return <LoadingBox message="Estimating costs..." />;
  if (error) return <ErrorBox message={error} />;
  if (!data) return <LoadingBox />;

  const mostExpensive = serverCosts?.[0];
  const maxServerRows = contentHeight ? Math.max(3, contentHeight - 16) : 10;

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1} gap={1}>
      {/* Summary cards */}
      <Box gap={4}>
        <Box flexDirection="column">
          <Text dimColor>MTD Estimate</Text>
          <Text bold color="green">{formatCurrency(data.mtdEstimate)}</Text>
        </Box>
        <Box flexDirection="column">
          <Text dimColor>Projected Monthly</Text>
          <Text bold color="yellow">{formatCurrency(data.projectedMonthly)}</Text>
        </Box>
        <Box flexDirection="column">
          <Text dimColor>Daily Average</Text>
          <Text bold>{formatCurrency(data.dailyAverage)}</Text>
        </Box>
      </Box>

      {/* Daily trend */}
      <Box flexDirection="column">
        <Box gap={2}>
          <Text bold>Daily Cost Trend</Text>
          <Sparkline data={data.dailyTrend} width={30} color="green" />
        </Box>
      </Box>

      {/* Most expensive callout */}
      {mostExpensive && mostExpensive.costSoFar > 0 && (
        <Box>
          <Text dimColor>Most expensive: </Text>
          <Text bold color={costColor(mostExpensive.monthlyEst)}>
            {mostExpensive.name}
          </Text>
          <Text dimColor> -- {formatCurrency(mostExpensive.costSoFar)} so far, </Text>
          <Text dimColor>{formatCurrency(mostExpensive.monthlyEst)}/mo projected</Text>
        </Box>
      )}

      {/* Per-server cost table */}
      <Box flexDirection="column">
        <Text bold>Per-Server Breakdown</Text>
        {serverLoading && !serverCosts ? (
          <Text dimColor>Loading...</Text>
        ) : !serverCosts || serverCosts.length === 0 ? (
          <Text dimColor>No VMs found</Text>
        ) : (
          <Box flexDirection="column" marginTop={1}>
            {/* Header */}
            <Box>
              <Box width={20}><Text bold dimColor>Name</Text></Box>
              <Box width={16}><Text bold dimColor>Type</Text></Box>
              <Box width={12}><Text bold dimColor>Status</Text></Box>
              <Box width={12}><Text bold dimColor>$/hr</Text></Box>
              <Box width={10}><Text bold dimColor>Uptime</Text></Box>
              <Box width={14}><Text bold dimColor>Cost So Far</Text></Box>
              <Box width={14}><Text bold dimColor>Monthly Est</Text></Box>
              <Box width={12}><Text bold dimColor>Disk/mo</Text></Box>
            </Box>
            <Box>
              <Text dimColor>{"\u2500".repeat(108)}</Text>
            </Box>
            {/* Rows */}
            {serverCosts.slice(0, maxServerRows).map((row: VMCostRow, i: number) => {
              const uptimeStr = row.uptimeHours > 0
                ? row.uptimeHours >= 24
                  ? `${Math.floor(row.uptimeHours / 24)}d ${Math.floor(row.uptimeHours % 24)}h`
                  : `${Math.floor(row.uptimeHours)}h`
                : "-";
              return (
                <Box key={row.name} >
                  <Box width={20}>
                    <Text dimColor={i % 2 === 1}>{truncate(row.name, 19)}</Text>
                  </Box>
                  <Box width={16}>
                    <Text dimColor={i % 2 === 1}>{row.machineType}</Text>
                  </Box>
                  <Box width={12}>
                    <Text color={row.status === "RUNNING" ? "green" : "yellow"}>
                      {row.status}
                    </Text>
                  </Box>
                  <Box width={12}>
                    <Text dimColor={row.hourlyRate === 0 || i % 2 === 1}>
                      {row.hourlyRate > 0 ? `$${row.hourlyRate.toFixed(4)}` : "-"}
                    </Text>
                  </Box>
                  <Box width={10}>
                    <Text dimColor={i % 2 === 1}>{uptimeStr}</Text>
                  </Box>
                  <Box width={14}>
                    <Text color={costColor(row.costSoFar)}>
                      {formatCurrency(row.costSoFar)}
                    </Text>
                  </Box>
                  <Box width={14}>
                    <Text color={costColor(row.monthlyEst)}>
                      {formatCurrency(row.monthlyEst)}
                    </Text>
                  </Box>
                  <Box width={12}>
                    <Text dimColor={i % 2 === 1}>
                      {formatCurrency(row.diskCostPerMonth)}
                    </Text>
                  </Box>
                </Box>
              );
            })}
            {serverCosts.length > maxServerRows && (
              <Text dimColor>... and {serverCosts.length - maxServerRows} more</Text>
            )}
          </Box>
        )}
      </Box>

      <Text dimColor italic>
        Stopped/terminated VMs: no compute charge, disk charges still apply.
      </Text>
    </Box>
  );
}
