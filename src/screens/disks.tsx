import React from "react";
import { Box, useInput } from "ink";
import { Table } from "../components/table.js";
import { LoadingBox } from "../components/loading-box.js";
import { ErrorBox } from "../components/error-box.js";
import { KeyHint } from "../components/key-hint.js";
import { useGcloudData } from "../hooks/use-gcloud-data.js";
import { useSelectedRow } from "../hooks/use-selected-row.js";
import { fetchDisks } from "../data/disks.js";
import type { Column } from "../types/index.js";

const COLUMNS: Column[] = [
  { key: "name", label: "Name", width: 24 },
  { key: "zone", label: "Zone", width: 18 },
  { key: "size", label: "Size", width: 10 },
  { key: "type", label: "Type", width: 12 },
  { key: "status", label: "Status", width: 10 },
  {
    key: "attachedTo",
    label: "Attached To",
    width: 20,
    color: (val) => (val === "-" ? "red" : undefined),
  },
  { key: "snapshots", label: "Snaps", width: 7 },
];

interface DisksScreenProps {
  active: boolean;
}

export function DisksScreen({ active }: DisksScreenProps) {
  const { data, loading, error, refresh } = useGcloudData(fetchDisks);
  const rows = data ?? [];
  const { selectedIndex } = useSelectedRow(rows.length, active);

  useInput(
    (input) => {
      if (input === "r") refresh();
    },
    { isActive: active },
  );

  if (loading && !data) return <LoadingBox message="Loading disks..." />;
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
