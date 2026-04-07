import { gcloudJSON } from "./gcloud.js";
import { formatDate } from "../utils/format.js";
import type { ServiceAccount, ServiceAccountKey, KeyRow } from "../types/index.js";

export async function fetchKeys(): Promise<KeyRow[]> {
  const accounts = await gcloudJSON<ServiceAccount[]>([
    "iam", "service-accounts", "list",
  ]);

  const results: KeyRow[] = [];

  for (const sa of accounts) {
    try {
      const keys = await gcloudJSON<ServiceAccountKey[]>([
        "iam", "service-accounts", "keys", "list",
        "--iam-account", sa.email,
      ]);

      for (const key of keys) {
        const keyId = key.name.split("/").pop() ?? key.name;
        const isExpired = new Date(key.validBeforeTime) < new Date();
        results.push({
          serviceAccount: sa.email,
          keyId: keyId.slice(0, 12),
          keyType: key.keyType,
          created: formatDate(key.validAfterTime),
          expires: formatDate(key.validBeforeTime),
          isUserManaged: key.keyType === "USER_MANAGED",
          isExpired,
        });
      }
    } catch {
      // skip accounts we can't read keys for
    }
  }

  return results;
}
