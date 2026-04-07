import { gcloudExec } from "../data/gcloud.js";

export async function startVM(name: string, zone: string): Promise<void> {
  await gcloudExec(["compute", "instances", "start", name, "--zone", zone]);
}

export async function stopVM(name: string, zone: string): Promise<void> {
  await gcloudExec(["compute", "instances", "stop", name, "--zone", zone]);
}

export async function deleteVM(name: string, zone: string): Promise<void> {
  await gcloudExec(["compute", "instances", "delete", name, "--zone", zone, "--quiet"]);
}

export function getSSHCommand(name: string, zone: string): string {
  return `gcloud compute ssh ${name} --zone=${zone}`;
}
