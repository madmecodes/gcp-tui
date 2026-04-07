export interface VM {
  name: string;
  status: string;
  zone: string;
  machineType: string;
  networkInterfaces: {
    networkIP: string;
    accessConfigs?: { natIP?: string }[];
  }[];
  disks?: {
    source?: string;
    diskSizeGb?: string;
    type?: string;
  }[];
  creationTimestamp: string;
  lastStartTimestamp?: string;
  id: string;
}

export interface VMRow {
  name: string;
  status: string;
  zone: string;
  machineType: string;
  internalIP: string;
  externalIP: string;
  uptime: string;
  vCPUs: number;
  memoryGB: number;
  diskGB: number;
  hourlyRate: number;
  uptimeHours: number;
}

export interface VMCostRow {
  name: string;
  machineType: string;
  status: string;
  hourlyRate: number;
  uptimeHours: number;
  costSoFar: number;
  monthlyEst: number;
  diskCostPerMonth: number;
}

export interface Disk {
  name: string;
  zone: string;
  sizeGb: string;
  type: string;
  status: string;
  users?: string[];
  sourceImage?: string;
  id: string;
}

export interface DiskRow {
  name: string;
  zone: string;
  size: string;
  type: string;
  status: string;
  attachedTo: string;
  snapshots: number;
}

export interface Snapshot {
  name: string;
  sourceDisk: string;
  diskSizeGb: string;
  status: string;
  creationTimestamp: string;
  storageBytes: string;
}

export interface FirewallRule {
  name: string;
  direction: string;
  priority: number;
  allowed?: { IPProtocol: string; ports?: string[] }[];
  denied?: { IPProtocol: string; ports?: string[] }[];
  sourceRanges?: string[];
  destinationRanges?: string[];
  targetTags?: string[];
  network: string;
  disabled: boolean;
}

export interface FirewallRow {
  name: string;
  direction: string;
  priority: number;
  action: string;
  protocols: string;
  sourceRanges: string;
  targets: string;
  isOpenToInternet: boolean;
}

export interface ServiceAccount {
  email: string;
  displayName: string;
  disabled: boolean;
  uniqueId: string;
}

export interface ServiceAccountKey {
  name: string;
  validAfterTime: string;
  validBeforeTime: string;
  keyAlgorithm: string;
  keyOrigin: string;
  keyType: string;
}

export interface KeyRow {
  serviceAccount: string;
  keyId: string;
  keyType: string;
  created: string;
  expires: string;
  isUserManaged: boolean;
  isExpired: boolean;
}

export interface GcloudConfig {
  project: string;
  account: string;
  region: string;
  zone: string;
}

export interface MetricDataPoint {
  timestamp: number;
  value: number;
}

export interface VMMetrics {
  vmName: string;
  cpu: MetricDataPoint[];
  networkIn: MetricDataPoint[];
  networkOut: MetricDataPoint[];
  currentCpu: number;
  currentNetworkIn: number;
  currentNetworkOut: number;
}

export interface CostEstimate {
  service: string;
  resourceCount: number;
  hourlyCost: number;
  dailyCost: number;
  monthlyCost: number;
}

export interface CostSummary {
  mtdEstimate: number;
  projectedMonthly: number;
  dailyAverage: number;
  byService: CostEstimate[];
  dailyTrend: number[];
}

export interface Column {
  key: string;
  label: string;
  width?: number;
  align?: "left" | "right" | "center";
  color?: (value: string, row: Record<string, unknown>) => string | undefined;
}

export interface MachineImage {
  name: string;
  status: string;
  sourceInstance: string;
  creationTimestamp: string;
  totalStorageBytes: string;
  storageLocations?: string[];
  sourceInstanceProperties?: {
    machineType?: string;
    disks?: {
      diskSizeGb?: string;
      diskType?: string;
    }[];
  };
}

export interface MachineImageRow {
  name: string;
  status: string;
  sourceInstance: string;
  machineType: string;
  diskSize: string;
  storageSize: string;
  location: string;
  created: string;
}

export interface BillingServiceRow {
  service: string;
  cost: number;
  credits: number;
  net: number;
}

export interface BillingResourceRow {
  service: string;
  resource: string;
  cost: number;
}

export interface RealBillingData {
  available: boolean;
  setupMessage?: string;
  byService: BillingServiceRow[];
  byResource: BillingResourceRow[];
  totalCost: number;
  totalCredits: number;
  periodStart: string;
  periodEnd: string;
}

export type TabName = "VMs" | "Costs" | "Billing" | "Keys" | "Disks" | "Images" | "Firewall" | "Metrics";
