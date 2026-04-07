import { gcloudJSON } from "./gcloud.js";
import { formatBytes, formatDate, formatGBSize } from "../utils/format.js";
import type { MachineImage, MachineImageRow, Snapshot } from "../types/index.js";

export interface ImagesData {
  machineImages: MachineImageRow[];
  snapshots: SnapshotRow[];
}

export interface SnapshotRow {
  name: string;
  sourceDisk: string;
  diskSize: string;
  storageSize: string;
  status: string;
  created: string;
}

export async function fetchImagesData(): Promise<ImagesData> {
  const [machineImages, snapshots] = await Promise.all([
    gcloudJSON<MachineImage[]>(["compute", "machine-images", "list"]).catch(() => [] as MachineImage[]),
    gcloudJSON<Snapshot[]>(["compute", "snapshots", "list"]).catch(() => [] as Snapshot[]),
  ]);

  return {
    machineImages: machineImages.map(toMachineImageRow),
    snapshots: snapshots.map(toSnapshotRow),
  };
}

function toMachineImageRow(img: MachineImage): MachineImageRow {
  const sourceInstance = img.sourceInstance?.split("/").pop() ?? "-";
  const machineType = img.sourceInstanceProperties?.machineType ?? "-";
  const totalDiskGB = (img.sourceInstanceProperties?.disks ?? []).reduce((sum, d) => {
    return sum + (d.diskSizeGb ? parseInt(d.diskSizeGb, 10) : 0);
  }, 0);
  const storageBytes = parseInt(img.totalStorageBytes ?? "0", 10);
  const location = img.storageLocations?.[0] ?? "-";

  return {
    name: img.name,
    status: img.status,
    sourceInstance,
    machineType,
    diskSize: totalDiskGB > 0 ? formatGBSize(totalDiskGB) : "-",
    storageSize: storageBytes > 0 ? formatBytes(storageBytes) : "-",
    location,
    created: formatDate(img.creationTimestamp),
  };
}

function toSnapshotRow(snap: Snapshot): SnapshotRow {
  const sourceDisk = snap.sourceDisk?.split("/").pop() ?? "-";
  const storageBytes = parseInt(snap.storageBytes ?? "0", 10);

  return {
    name: snap.name,
    sourceDisk,
    diskSize: formatGBSize(snap.diskSizeGb),
    storageSize: storageBytes > 0 ? formatBytes(storageBytes) : "-",
    status: snap.status,
    created: formatDate(snap.creationTimestamp),
  };
}
