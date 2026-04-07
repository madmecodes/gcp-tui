import React from "react";
import { Box, useInput } from "ink";
import { Table } from "../components/table.js";
import { LoadingBox } from "../components/loading-box.js";
import { ErrorBox } from "../components/error-box.js";
import { KeyHint } from "../components/key-hint.js";
import { useGcloudData } from "../hooks/use-gcloud-data.js";
import { useSelectedRow } from "../hooks/use-selected-row.js";
import { fetchKeys } from "../data/service-accounts.js";
import type { Column } from "../types/index.js";

const COLUMNS: Column[] = [
  { key: "serviceAccount", label: "Service Account", width: 35 },
  { key: "keyId", label: "Key ID", width: 14 },
  {
    key: "keyType",
    label: "Type",
    width: 16,
    color: (val) => (val === "USER_MANAGED" ? "yellow" : undefined),
  },
  { key: "created", label: "Created", width: 14 },
  {
    key: "expires",
    label: "Expires",
    width: 14,
    color: (_val, row) => ((row as Record<string, unknown>).isExpired ? "red" : undefined),
  },
];

interface KeysScreenProps {
  active: boolean;
}

export function KeysScreen({ active }: KeysScreenProps) {
  const { data, loading, error, refresh } = useGcloudData(fetchKeys);
  const rows = data ?? [];
  const { selectedIndex } = useSelectedRow(rows.length, active);

  useInput(
    (input) => {
      if (input === "r") refresh();
    },
    { isActive: active },
  );

  if (loading && !data) return <LoadingBox message="Loading service account keys..." />;
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
