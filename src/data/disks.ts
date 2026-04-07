import { gcloudJSON } from "./gcloud.js";
import { shortZone, formatGBSize } from "../utils/format.js";
import type { Disk, DiskRow, Snapshot } from "../types/index.js";

export async function fetchDisks(): Promise<DiskRow[]> {
  const [disks, snapshots] = await Promise.all([
    gcloudJSON<Disk[]>(["compute", "disks", "list"]),
    gcloudJSON<Snapshot[]>(["compute", "snapshots", "list"]).catch(() => [] as Snapshot[]),
  ]);

  const snapshotCounts = new Map<string, number>();
  for (const snap of snapshots) {
    const diskName = snap.sourceDisk.split("/").pop() ?? "";
    snapshotCounts.set(diskName, (snapshotCounts.get(diskName) ?? 0) + 1);
  }

  return disks.map((disk) => toDiskRow(disk, snapshotCounts));
}

function toDiskRow(disk: Disk, snapshotCounts: Map<string, number>): DiskRow {
  const attachedTo = disk.users?.[0]?.split("/").pop() ?? "-";
  const diskType = disk.type.split("/").pop() ?? disk.type;

  return {
    name: disk.name,
    zone: shortZone(disk.zone),
    size: formatGBSize(disk.sizeGb),
    type: diskType.replace("pd-", "").toUpperCase(),
    status: disk.status,
    attachedTo,
    snapshots: snapshotCounts.get(disk.name) ?? 0,
  };
}
