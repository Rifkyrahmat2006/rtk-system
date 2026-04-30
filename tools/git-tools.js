import { execSync } from "child_process";
import path from "path";
import projects from "../config/projects.json" with { type: "json" };

function resolveProject(project) {
  const p = projects.projects[project];
  if (!p) throw new Error(`Project "${project}" tidak ditemukan`);
  return path.resolve(p);
}

function execGit(cwd, command) {
  try {
    const result = execSync(`git ${command}`, { 
      cwd, 
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"]
    });
    return result.trim();
  } catch (error) {
    throw new Error(`Git error: ${error.message}`);
  }
}

export async function gitStatus(project) {
  const root = resolveProject(project);
  
  try {
    const status = execGit(root, "status --porcelain");
    const branch = execGit(root, "branch --show-current");
    
    const files = status.split("\n").filter(Boolean).map(line => {
      const status = line.substring(0, 2);
      const file = line.substring(3);
      return { status, file };
    });
    
    return {
      branch,
      files,
      clean: files.length === 0,
      modified: files.filter(f => f.status.includes("M")).length,
      added: files.filter(f => f.status.includes("A")).length,
      deleted: files.filter(f => f.status.includes("D")).length,
      untracked: files.filter(f => f.status.includes("?")).length
    };
  } catch (error) {
    throw new Error(`Not a git repository or git not available: ${error.message}`);
  }
}

export async function gitDiff(project, file = null) {
  const root = resolveProject(project);
  
  try {
    const command = file ? `diff ${file}` : "diff";
    const diff = execGit(root, command);
    
    return {
      file: file || "all",
      hasDiff: diff.length > 0,
      diff: diff.substring(0, 5000) // Limit to 5000 chars
    };
  } catch (error) {
    return { file: file || "all", hasDiff: false, diff: "" };
  }
}

export async function gitCommit(project, message, files = []) {
  const root = resolveProject(project);
  
  try {
    // Add files
    if (files.length > 0) {
      for (const file of files) {
        execGit(root, `add "${file}"`);
      }
    } else {
      execGit(root, "add -A");
    }
    
    // Commit
    const result = execGit(root, `commit -m "${message}"`);
    
    // Get commit hash
    const hash = execGit(root, "rev-parse HEAD");
    
    return {
      success: true,
      message,
      hash: hash.substring(0, 7),
      files: files.length || "all"
    };
  } catch (error) {
    throw new Error(`Commit failed: ${error.message}`);
  }
}

export async function gitBranch(project, branchName, create = false) {
  const root = resolveProject(project);
  
  try {
    if (create) {
      execGit(root, `checkout -b ${branchName}`);
      return {
        success: true,
        branch: branchName,
        created: true
      };
    } else {
      execGit(root, `checkout ${branchName}`);
      return {
        success: true,
        branch: branchName,
        created: false
      };
    }
  } catch (error) {
    throw new Error(`Branch operation failed: ${error.message}`);
  }
}

export async function gitLog(project, limit = 10) {
  const root = resolveProject(project);
  
  try {
    const log = execGit(root, `log --oneline -n ${limit}`);
    const commits = log.split("\n").map(line => {
      const [hash, ...messageParts] = line.split(" ");
      return {
        hash,
        message: messageParts.join(" ")
      };
    });
    
    return {
      commits,
      count: commits.length
    };
  } catch (error) {
    return { commits: [], count: 0 };
  }
}

export async function gitPull(project) {
  const root = resolveProject(project);
  
  try {
    const result = execGit(root, "pull");
    return {
      success: true,
      output: result
    };
  } catch (error) {
    throw new Error(`Pull failed: ${error.message}`);
  }
}

export async function gitPush(project) {
  const root = resolveProject(project);
  
  try {
    const result = execGit(root, "push");
    return {
      success: true,
      output: result
    };
  } catch (error) {
    throw new Error(`Push failed: ${error.message}`);
  }
}
