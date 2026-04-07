import React, { useState, useCallback } from "react";
import { Box, Text, useInput } from "ink";
import { Table } from "../components/table.js";
import { DetailPanel } from "../components/detail-panel.js";
import { LoadingBox } from "../components/loading-box.js";
import { ErrorBox } from "../components/error-box.js";
import { ConfirmDialog } from "../components/confirm-dialog.js";
import { KeyHint } from "../components/key-hint.js";
import { useGcloudData } from "../hooks/use-gcloud-data.js";
import { useSelectedRow } from "../hooks/use-selected-row.js";
import { fetchVMs } from "../data/vms.js";
import { startVM, stopVM, deleteVM, getSSHCommand } from "../actions/vm-actions.js";
import { statusColor } from "../utils/colors.js";
import type { Column, VMRow } from "../types/index.js";

const COLUMNS: Column[] = [
  { key: "name", label: "Name", width: 22 },
  {
    key: "status",
    label: "Status",
    width: 14,
    color: (val) => statusColor(val),
  },
  { key: "zone", label: "Zone", width: 18 },
  { key: "machineType", label: "Type", width: 16 },
  { key: "vCPUs", label: "CPUs", width: 6 },
  { key: "memoryGB", label: "RAM", width: 8 },
  { key: "diskGB", label: "Disk", width: 8 },
  { key: "internalIP", label: "Internal IP", width: 16 },
  { key: "externalIP", label: "External IP", width: 16 },
  { key: "uptime", label: "Uptime", width: 10 },
];

interface VMsScreenProps {
  active: boolean;
  contentHeight?: number;
  terminalWidth?: number;
}

export function VMsScreen({ active, contentHeight, terminalWidth }: VMsScreenProps) {
  const { data, loading, error, refresh } = useGcloudData(fetchVMs);
  const rows = data ?? [];
  const { selectedIndex } = useSelectedRow(rows.length, active);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    message: string;
    action: () => Promise<void>;
  } | null>(null);

  const selectedVM = rows[selectedIndex] as VMRow | undefined;

  // Reserve space for detail panel, key hints, action msgs
  const detailReserve = showDetail ? 12 : 0;
  const maxVisible = contentHeight ? Math.max(3, contentHeight - 5 - detailReserve) : 15;

  const handleAction = useCallback(async (action: () => Promise<void>, msg: string) => {
    setActionMsg(msg);
    try {
      await action();
      refresh();
    } catch (err) {
      setActionMsg(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
    setTimeout(() => setActionMsg(null), 3000);
  }, [refresh]);

  useInput(
    (input, key) => {
      if (!active || confirmAction) return;

      if (key.return && selectedVM) {
        setShowDetail((prev) => !prev);
        return;
      }

      if (!selectedVM) return;

      if (input === "s") {
        const vm = selectedVM;
        if (vm.status === "RUNNING") {
          handleAction(
            () => stopVM(vm.name, vm.zone),
            `Stopping ${vm.name}...`,
          );
        } else if (vm.status === "TERMINATED" || vm.status === "STOPPED") {
          handleAction(
            () => startVM(vm.name, vm.zone),
            `Starting ${vm.name}...`,
          );
        }
      } else if (input === "d") {
        const vm = selectedVM;
        setConfirmAction({
          message: `Delete VM "${vm.name}" in ${vm.zone}? This cannot be undone.`,
          action: () =>
            handleAction(
              () => deleteVM(vm.name, vm.zone),
              `Deleting ${vm.name}...`,
            ),
        });
      } else if (input === "S") {
        const cmd = getSSHCommand(selectedVM.name, selectedVM.zone);
        setActionMsg(`SSH: ${cmd}`);
        setTimeout(() => setActionMsg(null), 5000);
      } else if (input === "r") {
        refresh();
      }
    },
    { isActive: active && !confirmAction },
  );

  if (loading && !data) return <LoadingBox message="Loading VMs..." />;
  if (error) return <ErrorBox message={error} />;

  return (
    <Box flexDirection="column">
      <Table
        columns={COLUMNS}
        rows={rows as unknown as Record<string, unknown>[]}
        selectedIndex={selectedIndex}
        maxVisible={maxVisible}
        terminalWidth={terminalWidth}
      />
      {showDetail && selectedVM && (
        <DetailPanel vm={selectedVM} />
      )}
      {actionMsg && (
        <Box paddingX={2}>
          <Text color="yellow">{actionMsg}</Text>
        </Box>
      )}
      {confirmAction && (
        <ConfirmDialog
          message={confirmAction.message}
          onConfirm={() => {
            confirmAction.action();
            setConfirmAction(null);
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
      <KeyHint
        hints={[
          { key: "Enter", label: "details" },
          { key: "s", label: "start/stop" },
          { key: "d", label: "delete" },
          { key: "S", label: "SSH cmd" },
          { key: "r", label: "refresh" },
        ]}
      />
    </Box>
  );
}
