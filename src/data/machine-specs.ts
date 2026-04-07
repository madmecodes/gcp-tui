export interface MachineSpec {
  vCPUs: number;
  memoryGB: number;
  hourlyPrice: number;
}

const MACHINE_SPECS: Record<string, MachineSpec> = {
  "e2-micro":       { vCPUs: 2,    memoryGB: 1,    hourlyPrice: 0.0084 },
  "e2-small":       { vCPUs: 2,    memoryGB: 2,    hourlyPrice: 0.0168 },
  "e2-medium":      { vCPUs: 2,    memoryGB: 4,    hourlyPrice: 0.0336 },
  "e2-standard-2":  { vCPUs: 2,    memoryGB: 8,    hourlyPrice: 0.0671 },
  "e2-standard-4":  { vCPUs: 4,    memoryGB: 16,   hourlyPrice: 0.1342 },
  "e2-standard-8":  { vCPUs: 8,    memoryGB: 32,   hourlyPrice: 0.2684 },
  "e2-standard-16": { vCPUs: 16,   memoryGB: 64,   hourlyPrice: 0.5369 },
  "e2-highcpu-2":   { vCPUs: 2,    memoryGB: 2,    hourlyPrice: 0.0498 },
  "e2-highcpu-4":   { vCPUs: 4,    memoryGB: 4,    hourlyPrice: 0.0996 },
  "e2-highcpu-8":   { vCPUs: 8,    memoryGB: 8,    hourlyPrice: 0.1992 },
  "e2-highmem-2":   { vCPUs: 2,    memoryGB: 16,   hourlyPrice: 0.0904 },
  "e2-highmem-4":   { vCPUs: 4,    memoryGB: 32,   hourlyPrice: 0.1809 },
  "e2-highmem-8":   { vCPUs: 8,    memoryGB: 64,   hourlyPrice: 0.3618 },
  "n1-standard-1":  { vCPUs: 1,    memoryGB: 3.75, hourlyPrice: 0.0475 },
  "n1-standard-2":  { vCPUs: 2,    memoryGB: 7.5,  hourlyPrice: 0.0950 },
  "n1-standard-4":  { vCPUs: 4,    memoryGB: 15,   hourlyPrice: 0.1900 },
  "n1-standard-8":  { vCPUs: 8,    memoryGB: 30,   hourlyPrice: 0.3800 },
  "n2-standard-2":  { vCPUs: 2,    memoryGB: 8,    hourlyPrice: 0.0971 },
  "n2-standard-4":  { vCPUs: 4,    memoryGB: 16,   hourlyPrice: 0.1942 },
  "n2-standard-8":  { vCPUs: 8,    memoryGB: 32,   hourlyPrice: 0.3884 },
  "n2d-standard-2": { vCPUs: 2,    memoryGB: 8,    hourlyPrice: 0.0845 },
  "n2d-standard-4": { vCPUs: 4,    memoryGB: 16,   hourlyPrice: 0.1690 },
  "n2d-standard-8": { vCPUs: 8,    memoryGB: 32,   hourlyPrice: 0.3381 },
  "t2d-standard-1": { vCPUs: 1,    memoryGB: 4,    hourlyPrice: 0.0422 },
  "t2d-standard-2": { vCPUs: 2,    memoryGB: 8,    hourlyPrice: 0.0845 },
  "t2d-standard-4": { vCPUs: 4,    memoryGB: 16,   hourlyPrice: 0.1690 },
  "c2-standard-4":  { vCPUs: 4,    memoryGB: 16,   hourlyPrice: 0.2088 },
  "c2-standard-8":  { vCPUs: 8,    memoryGB: 32,   hourlyPrice: 0.4176 },
};

const FALLBACK_SPEC: MachineSpec = { vCPUs: 1, memoryGB: 4, hourlyPrice: 0.05 };

export function getMachineSpec(machineType: string): MachineSpec {
  return MACHINE_SPECS[machineType] ?? FALLBACK_SPEC;
}

// Disk pricing per GB/month
export const DISK_PRICES: Record<string, number> = {
  "pd-standard": 0.04,
  "pd-balanced": 0.10,
  "pd-ssd": 0.17,
  "pd-extreme": 0.125,
};
