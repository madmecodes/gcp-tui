export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatGBSize(gb: string | number): string {
  const n = typeof gb === "string" ? parseInt(gb, 10) : gb;
  if (n >= 1024) return `${(n / 1024).toFixed(1)} TB`;
  return `${n} GB`;
}

export function formatUptime(startTimestamp: string | undefined): string {
  if (!startTimestamp) return "-";
  const start = new Date(startTimestamp).getTime();
  const now = Date.now();
  const diffMs = now - start;
  if (diffMs < 0) return "-";

  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (days > 0) return `${days}d ${remainingHours}h`;
  if (hours > 0) return `${hours}h`;
  const minutes = Math.floor(diffMs / 60_000);
  return `${minutes}m`;
}

export function formatDate(isoString: string): string {
  if (!isoString) return "-";
  const d = new Date(isoString);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function formatShortCurrency(amount: number): string {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
  return `$${amount.toFixed(2)}`;
}

export function shortZone(zone: string): string {
  // "projects/xxx/zones/us-central1-a" -> "us-central1-a"
  const parts = zone.split("/");
  return parts[parts.length - 1] ?? zone;
}

export function shortMachineType(machineType: string): string {
  // "projects/xxx/machineTypes/e2-medium" -> "e2-medium"
  const parts = machineType.split("/");
  return parts[parts.length - 1] ?? machineType;
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + "\u2026";
}

export function formatVCPUs(vcpus: number): string {
  if (vcpus < 1) return vcpus.toString();
  return String(vcpus);
}

export function formatRate(hourly: number): string {
  return `$${hourly.toFixed(4)}/hr`;
}

export function getUptimeHours(startTimestamp: string | undefined): number {
  if (!startTimestamp) return 0;
  const start = new Date(startTimestamp).getTime();
  const now = Date.now();
  const diffMs = now - start;
  if (diffMs < 0) return 0;
  return diffMs / 3_600_000;
}
