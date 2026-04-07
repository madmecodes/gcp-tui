import { gcloudJSON } from "./gcloud.js";
import type { FirewallRule, FirewallRow } from "../types/index.js";

export async function fetchFirewallRules(): Promise<FirewallRow[]> {
  const rules = await gcloudJSON<FirewallRule[]>(["compute", "firewall-rules", "list"]);
  return rules.map(toFirewallRow);
}

function toFirewallRow(rule: FirewallRule): FirewallRow {
  const isAllow = (rule.allowed?.length ?? 0) > 0;
  const entries = isAllow ? rule.allowed! : rule.denied ?? [];

  const protocols = entries
    .map((e) => {
      if (e.ports?.length) return `${e.IPProtocol}:${e.ports.join(",")}`;
      return e.IPProtocol;
    })
    .join("; ");

  const sourceRanges = rule.sourceRanges?.join(", ") ?? "-";
  const targets = rule.targetTags?.join(", ") ?? "all";
  const isOpenToInternet = rule.sourceRanges?.includes("0.0.0.0/0") ?? false;

  return {
    name: rule.name,
    direction: rule.direction,
    priority: rule.priority,
    action: isAllow ? "ALLOW" : "DENY",
    protocols,
    sourceRanges,
    targets,
    isOpenToInternet,
  };
}
