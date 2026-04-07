const STATUS_COLORS: Record<string, string> = {
  RUNNING: "green",
  PROVISIONING: "yellow",
  STAGING: "yellow",
  STOPPING: "yellow",
  SUSPENDING: "yellow",
  SUSPENDED: "red",
  TERMINATED: "red",
  STOPPED: "red",
  REPAIRING: "yellow",
  READY: "green",
  CREATING: "yellow",
  DELETING: "yellow",
  FAILED: "red",
  RESTORING: "yellow",
  UP_TO_DATE: "green",
  ACTIVE: "green",
  DISABLED: "red",
};

export function statusColor(status: string): string {
  return STATUS_COLORS[status.toUpperCase()] ?? "white";
}

export function severityColor(isWarning: boolean): string {
  return isWarning ? "red" : "white";
}
