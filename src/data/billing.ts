import { gcloudJSON } from "./gcloud.js";
import { shortMachineType, getUptimeHours } from "../utils/format.js";
import { getMachineSpec, DISK_PRICES } from "./machine-specs.js";
import type { VM, CostSummary, CostEstimate, VMCostRow } from "../types/index.js";

export async function fetchCostEstimate(): Promise<CostSummary> {
  const vms = await gcloudJSON<VM[]>(["compute", "instances", "list"]);

  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const byType = new Map<string, { count: number; hourly: number }>();

  for (const vm of vms) {
    if (vm.status !== "RUNNING") continue;
    const type = shortMachineType(vm.machineType);
    const spec = getMachineSpec(type);
    const existing = byType.get(type) ?? { count: 0, hourly: 0 };
    existing.count += 1;
    existing.hourly += spec.hourlyPrice;
    byType.set(type, existing);
  }

  const computeHourly = Array.from(byType.values()).reduce((sum, v) => sum + v.hourly, 0);
  const computeDaily = computeHourly * 24;
  const computeMonthly = computeDaily * daysInMonth;

  const byService: CostEstimate[] = [];

  if (byType.size > 0) {
    byService.push({
      service: "Compute Engine",
      resourceCount: vms.filter((v) => v.status === "RUNNING").length,
      hourlyCost: computeHourly,
      dailyCost: computeDaily,
      monthlyCost: computeMonthly,
    });
  }

  const totalDaily = computeDaily;
  const mtdEstimate = totalDaily * dayOfMonth;
  const projectedMonthly = totalDaily * daysInMonth;

  const dailyTrend = Array.from({ length: Math.min(dayOfMonth, 14) }, () => totalDaily);

  return {
    mtdEstimate,
    projectedMonthly,
    dailyAverage: totalDaily,
    byService,
    dailyTrend,
  };
}

export async function fetchPerServerCosts(): Promise<VMCostRow[]> {
  const vms = await gcloudJSON<VM[]>(["compute", "instances", "list"]);

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  return vms.map((vm) => {
    const type = shortMachineType(vm.machineType);
    const spec = getMachineSpec(type);
    const uptimeHours = vm.status === "RUNNING" ? getUptimeHours(vm.lastStartTimestamp) : 0;
    const costSoFar = spec.hourlyPrice * uptimeHours;
    const monthlyEst = vm.status === "RUNNING" ? spec.hourlyPrice * 24 * daysInMonth : 0;

    const diskCostPerMonth = (vm.disks ?? []).reduce((sum, d) => {
      const sizeGB = d.diskSizeGb ? parseInt(d.diskSizeGb, 10) : 0;
      const diskType = d.type?.split("/").pop() ?? "pd-standard";
      const pricePerGB = DISK_PRICES[diskType] ?? 0.04;
      return sum + sizeGB * pricePerGB;
    }, 0);

    return {
      name: vm.name,
      machineType: type,
      status: vm.status,
      hourlyRate: spec.hourlyPrice,
      uptimeHours,
      costSoFar,
      monthlyEst,
      diskCostPerMonth,
    };
  }).sort((a, b) => b.costSoFar - a.costSoFar);
}
