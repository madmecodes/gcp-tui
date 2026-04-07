import type { VMMetrics, MetricDataPoint } from "../types/index.js";

let monitoringClient: any = null;

async function getClient(projectId: string) {
  if (monitoringClient) return monitoringClient;
  try {
    const { MetricServiceClient } = await import("@google-cloud/monitoring");
    monitoringClient = new MetricServiceClient();
    return monitoringClient;
  } catch {
    throw new Error("Cloud Monitoring API client not available");
  }
}

export async function fetchVMMetrics(
  projectId: string,
  vmName: string,
): Promise<VMMetrics> {
  const client = await getClient(projectId);
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 3600_000);

  const interval = {
    startTime: { seconds: Math.floor(oneHourAgo.getTime() / 1000) },
    endTime: { seconds: Math.floor(now.getTime() / 1000) },
  };

  const cpuData = await queryMetric(
    client,
    projectId,
    `metric.type="compute.googleapis.com/instance/cpu/utilization" AND resource.labels.instance_id="${vmName}"`,
    interval,
  );

  const networkInData = await queryMetric(
    client,
    projectId,
    `metric.type="compute.googleapis.com/instance/network/received_bytes_count" AND resource.labels.instance_id="${vmName}"`,
    interval,
  );

  const networkOutData = await queryMetric(
    client,
    projectId,
    `metric.type="compute.googleapis.com/instance/network/sent_bytes_count" AND resource.labels.instance_id="${vmName}"`,
    interval,
  );

  return {
    vmName,
    cpu: cpuData,
    networkIn: networkInData,
    networkOut: networkOutData,
    currentCpu: cpuData[cpuData.length - 1]?.value ?? 0,
    currentNetworkIn: networkInData[networkInData.length - 1]?.value ?? 0,
    currentNetworkOut: networkOutData[networkOutData.length - 1]?.value ?? 0,
  };
}

async function queryMetric(
  client: any,
  projectId: string,
  filter: string,
  interval: any,
): Promise<MetricDataPoint[]> {
  try {
    const [timeSeries] = await client.listTimeSeries({
      name: `projects/${projectId}`,
      filter,
      interval,
      view: "FULL",
    });

    if (!timeSeries?.length) return [];

    const series = timeSeries[0];
    return (series.points ?? []).map((point: any) => ({
      timestamp: Number(point.interval?.endTime?.seconds ?? 0) * 1000,
      value: point.value?.doubleValue ?? point.value?.int64Value ?? 0,
    })).reverse();
  } catch {
    return [];
  }
}

export async function fetchAllVMMetrics(
  projectId: string,
  vmNames: string[],
): Promise<VMMetrics[]> {
  const results: VMMetrics[] = [];
  for (const name of vmNames) {
    try {
      const metrics = await fetchVMMetrics(projectId, name);
      results.push(metrics);
    } catch {
      results.push({
        vmName: name,
        cpu: [],
        networkIn: [],
        networkOut: [],
        currentCpu: 0,
        currentNetworkIn: 0,
        currentNetworkOut: 0,
      });
    }
  }
  return results;
}
