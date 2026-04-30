import fs from "fs";
import path from "path";
import projects from "../config/projects.json" with { type: "json" };

function resolveProject(project) {
  const p = projects.projects[project];
  if (!p) throw new Error(`Project "${project}" tidak ditemukan`);
  return path.resolve(p);
}

function validatePath(projectRoot, filePath) {
  const resolved = path.resolve(projectRoot, filePath);
  if (!resolved.startsWith(projectRoot + path.sep) && resolved !== projectRoot) {
    throw new Error(`Access denied: ${filePath}`);
  }
  return resolved;
}

export async function writeFile(project, filePath, content, options = {}) {
  const root = resolveProject(project);
  const fullPath = validatePath(root, filePath);
  
  // Create backup if file exists
  if (fs.existsSync(fullPath) && !options.noBackup) {
    const backupPath = fullPath + ".backup";
    fs.copyFileSync(fullPath, backupPath);
  }
  
  // Ensure directory exists
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(fullPath, content, "utf-8");
  
  return {
    success: true,
    file: filePath,
    size: content.length,
    backup: !options.noBackup && fs.existsSync(fullPath + ".backup")
  };
}

export async function patchFile(project, filePath, patches) {
  const root = resolveProject(project);
  const fullPath = validatePath(root, filePath);
  
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  let content = fs.readFileSync(fullPath, "utf-8");
  const original = content;
  
  // Apply patches
  let applied = 0;
  for (const patch of patches) {
    if (content.includes(patch.oldText)) {
      content = content.replace(patch.oldText, patch.newText);
      applied++;
    }
  }
  
  if (applied === 0) {
    throw new Error("No patches could be applied");
  }
  
  // Create backup
  const backupPath = fullPath + ".backup";
  fs.writeFileSync(backupPath, original, "utf-8");
  
  // Write patched content
  fs.writeFileSync(fullPath, content, "utf-8");
  
  return {
    success: true,
    file: filePath,
    patchesApplied: applied,
    totalPatches: patches.length,
    backup: backupPath
  };
}

export async function deleteFile(project, filePath) {
  const root = resolveProject(project);
  const fullPath = validatePath(root, filePath);
  
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  // Create backup before delete
  const backupPath = fullPath + ".deleted";
  fs.copyFileSync(fullPath, backupPath);
  fs.unlinkSync(fullPath);
  
  return {
    success: true,
    file: filePath,
    backup: backupPath
  };
}

export async function rollback(project, filePath) {
  const root = resolveProject(project);
  const fullPath = validatePath(root, filePath);
  const backupPath = fullPath + ".backup";
  
  if (!fs.existsSync(backupPath)) {
    throw new Error(`No backup found for: ${filePath}`);
  }
  
  fs.copyFileSync(backupPath, fullPath);
  fs.unlinkSync(backupPath);
  
  return {
    success: true,
    file: filePath,
    restored: true
  };
}

export async function previewDiff(project, filePath, newContent) {
  const root = resolveProject(project);
  const fullPath = validatePath(root, filePath);
  
  let oldContent = "";
  if (fs.existsSync(fullPath)) {
    oldContent = fs.readFileSync(fullPath, "utf-8");
  }
  
  const oldLines = oldContent.split("\n");
  const newLines = newContent.split("\n");
  
  const diff = [];
  const maxLen = Math.max(oldLines.length, newLines.length);
  
  for (let i = 0; i < maxLen; i++) {
    if (oldLines[i] !== newLines[i]) {
      if (oldLines[i] !== undefined) {
        diff.push({ line: i + 1, type: "removed", text: oldLines[i] });
      }
      if (newLines[i] !== undefined) {
        diff.push({ line: i + 1, type: "added", text: newLines[i] });
      }
    }
  }
  
  return {
    file: filePath,
    changes: diff.length,
    diff: diff.slice(0, 50) // Limit to 50 changes for preview
  };
}
