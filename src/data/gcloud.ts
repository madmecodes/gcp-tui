import { execJSON } from "../utils/exec.js";

export async function gcloudJSON<T>(args: string[]): Promise<T> {
  return execJSON<T>("gcloud", [...args, "--format=json"]);
}

export async function gcloudExec(args: string[]): Promise<string> {
  const { exec } = await import("../utils/exec.js");
  return exec("gcloud", args);
}
