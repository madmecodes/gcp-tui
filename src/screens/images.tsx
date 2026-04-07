import React from "react";
import { Box, Text, useInput } from "ink";
import { Table } from "../components/table.js";
import { LoadingBox } from "../components/loading-box.js";
import { ErrorBox } from "../components/error-box.js";
import { KeyHint } from "../components/key-hint.js";
import { useGcloudData } from "../hooks/use-gcloud-data.js";
import { useSelectedRow } from "../hooks/use-selected-row.js";
import { fetchImagesData } from "../data/machine-images.js";
import { statusColor } from "../utils/colors.js";
import type { Column } from "../types/index.js";

const IMAGE_COLUMNS: Column[] = [
  { key: "name", label: "Name", width: 28 },
  {
    key: "status",
    label: "Status",
    width: 10,
    color: (val) => statusColor(val),
  },
  { key: "sourceInstance", label: "Source VM", width: 22 },
  { key: "machineType", label: "Type", width: 16 },
  { key: "diskSize", label: "Disk", width: 10 },
  { key: "storageSize", label: "Storage", width: 12 },
  { key: "location", label: "Location", width: 10 },
  { key: "created", label: "Created", width: 14 },
];

const SNAPSHOT_COLUMNS: Column[] = [
  { key: "name", label: "Name", width: 30 },
  {
    key: "status",
    label: "Status",
    width: 10,
    color: (val) => statusColor(val),
  },
  { key: "sourceDisk", label: "Source Disk", width: 24 },
  { key: "diskSize", label: "Disk Size", width: 10 },
  { key: "storageSize", label: "Storage", width: 12 },
  { key: "created", label: "Created", width: 14 },
];

interface ImagesScreenProps {
  active: boolean;
}

export function ImagesScreen({ active }: ImagesScreenProps) {
  const { data, loading, error, refresh } = useGcloudData(fetchImagesData);
  const machineImages = data?.machineImages ?? [];
  const snapshots = data?.snapshots ?? [];
  const { selectedIndex } = useSelectedRow(machineImages.length, active);

  useInput(
    (input) => {
      if (input === "r") refresh();
    },
    { isActive: active },
  );

  if (loading && !data) return <LoadingBox message="Loading images..." />;
  if (error) return <ErrorBox message={error} />;

  return (
    <Box flexDirection="column">
      <Box paddingX={2} paddingY={1}>
        <Text bold>Machine Images</Text>
        <Text dimColor>  ({machineImages.length})</Text>
      </Box>
      {machineImages.length === 0 ? (
        <Box paddingX={2}>
          <Text dimColor>No machine images</Text>
        </Box>
      ) : (
        <Table
          columns={IMAGE_COLUMNS}
          rows={machineImages as unknown as Record<string, unknown>[]}
          selectedIndex={selectedIndex}
        />
      )}

      <Box paddingX={2} paddingY={1}>
        <Text bold>Snapshots</Text>
        <Text dimColor>  ({snapshots.length})</Text>
      </Box>
      {snapshots.length === 0 ? (
        <Box paddingX={2}>
          <Text dimColor>No snapshots</Text>
        </Box>
      ) : (
        <Table
          columns={SNAPSHOT_COLUMNS}
          rows={snapshots as unknown as Record<string, unknown>[]}
          selectedIndex={-1}
        />
      )}

      <KeyHint
        hints={[
          { key: "r", label: "refresh" },
        ]}
      />
    </Box>
  );
}
