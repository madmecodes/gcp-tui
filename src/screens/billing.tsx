import React from "react";
import { Box, Text, useInput } from "ink";
import { LoadingBox } from "../components/loading-box.js";
import { ErrorBox } from "../components/error-box.js";
import { useGcloudData } from "../hooks/use-gcloud-data.js";
import { fetchRealBilling } from "../data/billing-real.js";
import { formatCurrency, truncate } from "../utils/format.js";

function costColor(amount: number): string {
  if (amount > 50) return "red";
  if (amount > 10) return "yellow";
  return "green";
}

interface BillingScreenProps {
  active: boolean;
  contentHeight?: number;
}

export function BillingScreen({ active, contentHeight }: BillingScreenProps) {
  const { data, loading, error, refresh } = useGcloudData(fetchRealBilling, 120_000);

  useInput(
    (input) => {
      if (input === "r") refresh();
    },
    { isActive: active },
  );

  if (loading && !data) return <LoadingBox message="Querying billing data..." />;
  if (error) return <ErrorBox message={error} />;
  if (!data) return <LoadingBox />;

  if (!data.available) {
    return (
      <Box flexDirection="column" paddingX={2} paddingY={1}>
        <Text bold color="yellow">Billing Export Not Configured</Text>
        <Box marginTop={1} flexDirection="column">
          {data.setupMessage?.split("\n").map((line, i) => (
            <Text key={i} color={line.startsWith("1.") || line.startsWith("2.") || line.startsWith("3.") || line.startsWith("4.") || line.startsWith("5.") ? "white" : "white"} dimColor={!line.match(/^\d/)}>
              {line}
            </Text>
          ))}
        </Box>
      </Box>
    );
  }

  const maxResourceRows = contentHeight ? Math.max(3, contentHeight - 14 - data.byService.length) : 10;

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1} gap={1}>
      {/* Period + totals */}
      <Box gap={4}>
        <Box flexDirection="column">
          <Text dimColor>Period</Text>
          <Text bold>{data.periodStart} to {data.periodEnd}</Text>
        </Box>
        <Box flexDirection="column">
          <Text dimColor>Total Cost</Text>
          <Text bold color={costColor(data.totalCost)}>{formatCurrency(data.totalCost)}</Text>
        </Box>
        <Box flexDirection="column">
          <Text dimColor>Credits</Text>
          <Text bold color="cyan">{formatCurrency(data.totalCredits)}</Text>
        </Box>
        <Box flexDirection="column">
          <Text dimColor>Net</Text>
          <Text bold color={costColor(data.totalCost + data.totalCredits)}>
            {formatCurrency(data.totalCost + data.totalCredits)}
          </Text>
        </Box>
      </Box>

      {/* By service */}
      <Box flexDirection="column">
        <Text bold>Cost by Service (actual)</Text>
        <Box flexDirection="column" marginTop={1}>
          <Box>
            <Box width={30}><Text bold dimColor>Service</Text></Box>
            <Box width={14}><Text bold dimColor>Cost</Text></Box>
            <Box width={14}><Text bold dimColor>Credits</Text></Box>
            <Box width={14}><Text bold dimColor>Net</Text></Box>
          </Box>
          <Text dimColor>{"\u2500".repeat(70)}</Text>
          {data.byService.length === 0 ? (
            <Text dimColor>No billing data for this period yet</Text>
          ) : (
            data.byService.map((svc, i) => (
              <Box key={svc.service}>
                <Box width={30}>
                  <Text dimColor={i % 2 === 1}>{truncate(svc.service, 29)}</Text>
                </Box>
                <Box width={14}>
                  <Text color={costColor(svc.cost)}>{formatCurrency(svc.cost)}</Text>
                </Box>
                <Box width={14}>
                  <Text color="cyan">{formatCurrency(svc.credits)}</Text>
                </Box>
                <Box width={14}>
                  <Text color={costColor(svc.net)}>{formatCurrency(svc.net)}</Text>
                </Box>
              </Box>
            ))
          )}
        </Box>
      </Box>

      {/* By resource */}
      {data.byResource.length > 0 && (
        <Box flexDirection="column">
          <Text bold>Top Resources by Cost (actual)</Text>
          <Box flexDirection="column" marginTop={1}>
            <Box>
              <Box width={24}><Text bold dimColor>Service</Text></Box>
              <Box width={36}><Text bold dimColor>Resource</Text></Box>
              <Box width={14}><Text bold dimColor>Cost</Text></Box>
            </Box>
            <Text dimColor>{"\u2500".repeat(72)}</Text>
            {data.byResource.slice(0, maxResourceRows).map((res, i) => (
              <Box key={`${res.service}-${res.resource}-${i}`}>
                <Box width={24}>
                  <Text dimColor={i % 2 === 1}>{truncate(res.service, 23)}</Text>
                </Box>
                <Box width={36}>
                  <Text dimColor={i % 2 === 1}>{truncate(res.resource, 35)}</Text>
                </Box>
                <Box width={14}>
                  <Text color={costColor(res.cost)}>{formatCurrency(res.cost)}</Text>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      <Text dimColor italic>
        Real billing data from BigQuery export. Press r to refresh.
      </Text>
    </Box>
  );
}
