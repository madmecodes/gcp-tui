import { exec } from "../utils/exec.js";
import type { GcloudConfig } from "../types/index.js";

async function getConfigValue(key: string): Promise<string> {
  try {
    const result = await exec("gcloud", ["config", "get-value", key]);
    return result.trim();
  } catch {
    return "";
  }
}

export async function getGcloudConfig(): Promise<GcloudConfig> {
  const [project, account, region, zone] = await Promise.all([
    getConfigValue("project"),
    getConfigValue("core/account"),
    getConfigValue("compute/region"),
    getConfigValue("compute/zone"),
  ]);

  return { project, account, region, zone };
}

export async function checkGcloudInstalled(): Promise<boolean> {
  try {
    await exec("gcloud", ["--version"]);
    return true;
  } catch {
    return false;
  }
}

export async function checkAuthenticated(): Promise<boolean> {
  try {
    const result = await exec("gcloud", ["auth", "list", "--format=json"]);
    const accounts = JSON.parse(result) as { status: string }[];
    return accounts.some((a) => a.status === "ACTIVE");
  } catch {
    return false;
  }
}
