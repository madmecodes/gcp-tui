import { execFile as cpExecFile } from "node:child_process";

const DEFAULT_TIMEOUT = 30_000;

export class ExecError extends Error {
  constructor(
    message: string,
    public readonly exitCode: number | null,
    public readonly stderr: string,
  ) {
    super(message);
    this.name = "ExecError";
  }
}

export function exec(
  command: string,
  args: string[],
  timeout = DEFAULT_TIMEOUT,
): Promise<string> {
  return new Promise((resolve, reject) => {
    cpExecFile(command, args, { timeout, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        reject(new ExecError(
          `${command} ${args.join(" ")} failed: ${stderr || error.message}`,
          ((error as NodeJS.ErrnoException & { code?: number }).code as unknown as number | null) ?? null,
          stderr,
        ));
        return;
      }
      resolve(stdout);
    });
  });
}

export async function execJSON<T>(
  command: string,
  args: string[],
  timeout = DEFAULT_TIMEOUT,
): Promise<T> {
  const stdout = await exec(command, args, timeout);
  try {
    return JSON.parse(stdout) as T;
  } catch {
    throw new Error(`Failed to parse JSON output from ${command}: ${stdout.slice(0, 200)}`);
  }
}
