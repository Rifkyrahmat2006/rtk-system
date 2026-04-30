import { execFileSync } from "child_process";

const ALLOWED_COMMANDS = new Set(["ls", "dir", "cat", "pwd", "echo"]);

export function runCommand(cmd) {
  if (typeof cmd !== "string" || !cmd.trim()) return "Invalid command";

  const [bin, ...args] = cmd.trim().split(/\s+/);

  if (!ALLOWED_COMMANDS.has(bin)) return `Command not allowed: ${bin}`;

  try {
    return execFileSync(bin, args, { timeout: 5000 }).toString();
  } catch (e) {
    return e.message;
  }
}
