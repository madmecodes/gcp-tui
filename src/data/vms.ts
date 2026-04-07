import { gcloudJSON } from "./gcloud.js";
import { shortZone, shortMachineType, formatUptime, getUptimeHours } from "../utils/format.js";
import { getMachineSpec } from "./machine-specs.js";
import type { VM, VMRow } from "../types/index.js";

export async function fetchVMs(): Promise<VMRow[]> {
  const vms = await gcloudJSON<VM[]>(["compute", "instances", "list"]);
  return vms.map(toVMRow);
}

function toVMRow(vm: VM): VMRow {
  const iface = vm.networkInterfaces?.[0];
  const externalIP = iface?.accessConfigs?.[0]?.natIP ?? "-";
  const internalIP = iface?.networkIP ?? "-";
  const type = shortMachineType(vm.machineType);
  const spec = getMachineSpec(type);

  const diskGB = (vm.disks ?? []).reduce((sum, d) => {
    return sum + (d.diskSizeGb ? parseInt(d.diskSizeGb, 10) : 0);
  }, 0);

  const uptimeHours = vm.status === "RUNNING" ? getUptimeHours(vm.lastStartTimestamp) : 0;

  return {
    name: vm.name,
    status: vm.status,
    zone: shortZone(vm.zone),
    machineType: type,
    internalIP,
    externalIP,
    uptime: vm.status === "RUNNING" ? formatUptime(vm.lastStartTimestamp) : "-",
    vCPUs: spec.vCPUs,
    memoryGB: spec.memoryGB,
    diskGB,
    hourlyRate: spec.hourlyPrice,
    uptimeHours,
  };
}
