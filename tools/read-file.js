import fs from "fs";
import path from "path";
import projects from "../config/projects.json" with { type: "json" };

const allowedRoots = Object.values(projects.projects).map((p) => path.resolve(p));

export function readFile(filePath) {
  const resolved = path.resolve(filePath);
  const allowed = allowedRoots.some((root) => resolved.startsWith(root + path.sep) || resolved === root);
  if (!allowed) throw new Error(`Access denied: ${filePath}`);
  return fs.readFileSync(resolved, "utf-8");
}
