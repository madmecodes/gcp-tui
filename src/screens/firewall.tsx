import React from "react";
import { Box, useInput } from "ink";
import { Table } from "../components/table.js";
import { LoadingBox } from "../components/loading-box.js";
import { ErrorBox } from "../components/error-box.js";
import { KeyHint } from "../components/key-hint.js";
import { useGcloudData } from "../hooks/use-gcloud-data.js";
import { useSelectedRow } from "../hooks/use-selected-row.js";
import { fetchFirewallRules } from "../data/firewall.js";
import type { Column } from "../types/index.js";

const COLUMNS: Column[] = [
  { key: "name", label: "Name", width: 28 },
  { key: "direction", label: "Dir", width: 10 },
  { key: "priority", label: "Priority", width: 10 },
  { key: "action", label: "Action", width: 8 },
  { key: "protocols", label: "Protocols/Ports", width: 20 },
  {
    key: "sourceRanges",
    label: "Source Ranges",
    width: 18,
    color: (_val, row) =>
      (row as Record<string, unknown>).isOpenToInternet ? "red" : undefined,
  },
  { key: "targets", label: "Targets", width: 16 },
];

interface FirewallScreenProps {
  active: boolean;
}

export function FirewallScreen({ active }: FirewallScreenProps) {
  const { data, loading, error, refresh } = useGcloudData(fetchFirewallRules);
  const rows = data ?? [];
  const { selectedIndex } = useSelectedRow(rows.length, active);

  useInput(
    (input) => {
      if (input === "r") refresh();
    },
    { isActive: active },
  );

  if (loading && !data) return <LoadingBox message="Loading firewall rules..." />;
  if (error) return <ErrorBox message={error} />;

  return (
    <Box flexDirection="column">
      <Table
        columns={COLUMNS}
        rows={rows as unknown as Record<string, unknown>[]}
        selectedIndex={selectedIndex}
      />
      <KeyHint
        hints={[
          { key: "r", label: "refresh" },
        ]}
      />
    </Box>
  );
}
