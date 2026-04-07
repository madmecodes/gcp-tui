import { exec } from "../utils/exec.js";
import type { RealBillingData, BillingServiceRow, BillingResourceRow } from "../types/index.js";

interface BqRow {
  service?: string;
  resource_name?: string;
  cost?: number | string;
  credits?: number | string;
  net?: number | string;
}

async function getProjectId(): Promise<string> {
  const result = await exec("gcloud", ["config", "get-value", "project"]);
  return result.trim();
}

async function findBillingTable(): Promise<string | null> {
  const projectId = await getProjectId();

  // Check common dataset names for billing export tables
  const datasets = ["gcp_billing_export", "billing", "billing_export"];

  for (const ds of datasets) {
    try {
      const tablesRaw = await exec("bq", ["ls", "--format=json", `${projectId}:${ds}`], 10_000);
      const tables = JSON.parse(tablesRaw) as { tableReference: { tableId: string } }[];
      const billingTable = tables.find(
        (t) => t.tableReference.tableId.startsWith("gcp_billing_export"),
      );
      if (billingTable) {
        return `\`${projectId}.${ds}.${billingTable.tableReference.tableId}\``;
      }
    } catch {
      // dataset doesn't exist or no access
    }
  }

  // Fallback: search all datasets
  try {
    const allDatasetsRaw = await exec("bq", ["ls", "--format=json", "--project_id", projectId], 10_000);
    const allDatasets = JSON.parse(allDatasetsRaw) as { datasetReference: { datasetId: string } }[];

    for (const ds of allDatasets) {
      const dsId = ds.datasetReference.datasetId;
      if (datasets.includes(dsId)) continue; // already checked
      try {
        const tablesRaw = await exec("bq", ["ls", "--format=json", `${projectId}:${dsId}`], 10_000);
        const tables = JSON.parse(tablesRaw) as { tableReference: { tableId: string } }[];
        const billingTable = tables.find(
          (t) => t.tableReference.tableId.startsWith("gcp_billing_export"),
        );
        if (billingTable) {
          return `\`${projectId}.${dsId}.${billingTable.tableReference.tableId}\``;
        }
      } catch {
        // skip
      }
    }
  } catch {
    // bq ls failed
  }

  return null;
}

export async function fetchRealBilling(): Promise<RealBillingData> {
  const table = await findBillingTable();

  if (!table) {
    return {
      available: false,
      setupMessage: [
        "BigQuery billing export is not configured.",
        "",
        "To enable real cost data:",
        "1. Go to Cloud Console > Billing > Billing export",
        "2. Select 'BigQuery export' tab",
        "3. Set project to 'redclaw-test'",
        "4. Set dataset to 'gcp_billing_export'",
        "5. Enable 'Detailed usage cost' export",
        "",
        "Data will appear within 24 hours.",
        "Dataset 'gcp_billing_export' has been pre-created.",
      ].join("\n"),
      byService: [],
      byResource: [],
      totalCost: 0,
      totalCredits: 0,
      periodStart: "",
      periodEnd: "",
    };
  }

  // Query by service
  const serviceQuery = `
    SELECT
      service.description AS service,
      ROUND(SUM(cost), 2) AS cost,
      ROUND(SUM(IFNULL((SELECT SUM(c.amount) FROM UNNEST(credits) c), 0)), 2) AS credits,
      ROUND(SUM(cost) + SUM(IFNULL((SELECT SUM(c.amount) FROM UNNEST(credits) c), 0)), 2) AS net
    FROM ${table}
    WHERE DATE(usage_start_time) >= DATE_TRUNC(CURRENT_DATE(), MONTH)
    GROUP BY service
    ORDER BY cost DESC
  `;

  // Query by resource (top 20)
  const resourceQuery = `
    SELECT
      service.description AS service,
      IFNULL(resource.name, sku.description) AS resource_name,
      ROUND(SUM(cost), 2) AS cost
    FROM ${table}
    WHERE DATE(usage_start_time) >= DATE_TRUNC(CURRENT_DATE(), MONTH)
      AND cost > 0
    GROUP BY service, resource_name
    ORDER BY cost DESC
    LIMIT 20
  `;

  const [serviceRows, resourceRows] = await Promise.all([
    bqQuery<BqRow>(serviceQuery),
    bqQuery<BqRow>(resourceQuery),
  ]);

  const byService: BillingServiceRow[] = serviceRows.map((r) => ({
    service: r.service ?? "Unknown",
    cost: toNum(r.cost),
    credits: toNum(r.credits),
    net: toNum(r.net),
  }));

  const byResource: BillingResourceRow[] = resourceRows.map((r) => ({
    service: r.service ?? "Unknown",
    resource: shortenResource(r.resource_name ?? "Unknown"),
    cost: toNum(r.cost),
  }));

  const totalCost = byService.reduce((sum, s) => sum + s.cost, 0);
  const totalCredits = byService.reduce((sum, s) => sum + s.credits, 0);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    available: true,
    byService,
    byResource,
    totalCost,
    totalCredits,
    periodStart: monthStart.toISOString().slice(0, 10),
    periodEnd: now.toISOString().slice(0, 10),
  };
}

async function bqQuery<T>(query: string): Promise<T[]> {
  try {
    const result = await exec(
      "bq",
      ["query", "--use_legacy_sql=false", "--format=json", "--max_rows=50", query],
      30_000,
    );
    const trimmed = result.trim();
    if (!trimmed || trimmed === "[]") return [];
    return JSON.parse(trimmed) as T[];
  } catch {
    return [];
  }
}

function toNum(val: number | string | undefined): number {
  if (val == null) return 0;
  if (typeof val === "number") return val;
  return parseFloat(val) || 0;
}

function shortenResource(name: string): string {
  // Strip long project/zone prefixes
  const parts = name.split("/");
  if (parts.length > 2) {
    return parts.slice(-2).join("/");
  }
  return name;
}
