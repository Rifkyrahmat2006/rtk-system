#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import dotenv from "dotenv";
import { orchestrator, exploreAgent, searchAgent, readerAgent, clearCache } from "../agents/orchestrator.js";
import { semanticSearch, getIndexStats, clearIndex } from "../rag/search.js";
import { writeFile, patchFile, rollback, previewDiff } from "../tools/code-modifier.js";
import { gitStatus, gitDiff, gitCommit, gitLog } from "../tools/git-tools.js";
import * as Projects from "../db/projects.js";
import * as Tasks from "../db/tasks.js";
import * as ActivityLogs from "../db/activity-logs.js";
import * as FileIndex from "../db/file-index.js";

dotenv.config();

const server = new McpServer({ name: "rtk-system", version: "5.0.0" });

// rtk_project_list
server.tool(
  "rtk_project_list",
  "List all registered projects",
  {},
  async () => {
    const projects = await Projects.getAllProjects();
    
    if (projects.length === 0) {
      return { content: [{ type: "text", text: "No projects registered" }] };
    }
    
    const lines = [`📁 Registered Projects (${projects.length}):\n`];
    for (const p of projects) {
      const stats = await FileIndex.getIndexStats(p.name);
      const indexed = stats ? `${stats.total_files} files, ${stats.total_chunks} chunks` : "not indexed";
      lines.push(`  ${p.name} - ${indexed}`);
      lines.push(`    Path: ${p.path}`);
      if (p.tech_stack) lines.push(`    Stack: ${p.tech_stack}`);
    }
    
    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);

// rtk_ask
server.tool(
  "rtk_ask",
  "Ask RTK about project with natural language",
  {
    project: z.string().describe("Project name"),
    prompt: z.string().describe("Question or command"),
  },
  async ({ project, prompt }) => {
    const results = await orchestrator(project, prompt);
    const parts = [];

    if (results.semantic) {
      parts.push(results.semantic.formatted);
    }
    if (results.explore) {
      parts.push(`## 📁 Structure: ${project}\n${JSON.stringify(results.explore.tree, null, 2)}`);
    }
    if (results.search) {
      parts.push(`## 🔍 Search Results\n${JSON.stringify(results.search, null, 2)}`);
    }
    if (results.read) {
      parts.push(`## 📄 ${results.read.file}\n\`\`\`\n${results.read.content}\n\`\`\``);
    }

    return { content: [{ type: "text", text: parts.join("\n\n") || "No results" }] };
  }
);

// rtk_semantic_search
server.tool(
  "rtk_semantic_search",
  "Semantic code search using RAG",
  {
    project: z.string(),
    query: z.string(),
    topK: z.number().min(1).max(20).default(5).optional(),
  },
  async ({ project, query, topK = 5 }) => {
    const results = await semanticSearch(project, query, topK);
    
    if (results.length === 0) {
      return { content: [{ type: "text", text: `❌ No results. Index project first: npm run index ${project}` }] };
    }

    const lines = [`🧠 Semantic Search: "${query}" (${results.length} results)\n`];
    for (const r of results) {
      lines.push(`📄 ${r.file} (L${r.startLine}-${r.endLine}) - score: ${r.score.toFixed(2)}`);
      lines.push(`   ${r.snippet.slice(0, 150)}...\n`);
    }
    
    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);

// rtk_explore
server.tool(
  "rtk_explore",
  "Explore project structure",
  {
    project: z.string(),
    depth: z.number().min(1).max(5).default(2),
  },
  async ({ project, depth }) => {
    const result = await exploreAgent(project, { depth });
    return { content: [{ type: "text", text: `📁 ${project}\nRoot: ${result.root}\n\n${JSON.stringify(result.tree, null, 2)}` }] };
  }
);

// rtk_task_list
server.tool(
  "rtk_task_list",
  "List tasks for a project",
  {
    project: z.string(),
    limit: z.number().min(1).max(50).default(10).optional(),
  },
  async ({ project, limit = 10 }) => {
    const tasks = await Tasks.getTasksByProject(project, limit);
    
    if (tasks.length === 0) {
      return { content: [{ type: "text", text: `No tasks found for ${project}` }] };
    }
    
    const lines = [`📋 Tasks for ${project} (${tasks.length}):\n`];
    tasks.forEach(t => {
      lines.push(`  ${t.status === 'completed' ? '✅' : t.status === 'failed' ? '❌' : '⏳'} ${t.id.slice(0, 8)} - ${t.goal} [${t.status}]`);
    });
    
    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);

// rtk_activity_logs
server.tool(
  "rtk_activity_logs",
  "Get activity logs for a project",
  {
    project: z.string(),
    limit: z.number().min(1).max(100).default(50).optional(),
  },
  async ({ project, limit = 50 }) => {
    const logs = await ActivityLogs.getActivityLogs(project, limit);
    
    if (logs.length === 0) {
      return { content: [{ type: "text", text: `No activity logs for ${project}` }] };
    }
    
    const lines = [`📊 Activity Logs for ${project} (${logs.length}):\n`];
    logs.forEach(log => {
      const time = new Date(log.created_at).toLocaleString();
      lines.push(`  [${time}] ${log.action} - ${log.message}`);
      if (log.file_path) lines.push(`    📄 ${log.file_path}`);
    });
    
    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);

// rtk_search
server.tool(
  "rtk_search",
  "Keyword search in project files",
  {
    project: z.string(),
    keyword: z.string(),
  },
  async ({ project, keyword }) => {
    const result = await searchAgent(project, keyword);
    
    if (!result.results.length) {
      return { content: [{ type: "text", text: `No results for "${keyword}"` }] };
    }
    
    const lines = [`🔍 Search "${keyword}" (${result.results.length} files):\n`];
    for (const r of result.results) {
      lines.push(`📄 ${r.file}`);
      for (const m of r.matches.slice(0, 3)) {
        lines.push(`   L${m.line}: ${m.text}`);
      }
    }
    
    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);

// rtk_read
server.tool(
  "rtk_read",
  "Read file contents",
  {
    project: z.string(),
    file: z.string(),
    lineStart: z.number().optional(),
    lineEnd: z.number().optional(),
    maxChars: z.number().default(80000).optional(),
  },
  async ({ project, file, lineStart, lineEnd, maxChars = 80000 }) => {
    const result = await readerAgent(project, file, null, { maxChars, lineStart, lineEnd });
    const ext = file.split(".").pop();
    return { content: [{ type: "text", text: `📄 ${file}\n\`\`\`${ext}\n${result.content}\n\`\`\`` }] };
  }
);

// rtk_write
server.tool(
  "rtk_write",
  "Write or overwrite file",
  {
    project: z.string(),
    file: z.string(),
    content: z.string(),
  },
  async ({ project, file, content }) => {
    const result = await writeFile(project, file, content);
    return { content: [{ type: "text", text: `✅ File ${file} written (${result.size} chars)` }] };
  }
);

// rtk_patch
server.tool(
  "rtk_patch",
  "Apply patches to file",
  {
    project: z.string(),
    file: z.string(),
    patches: z.array(z.object({
      oldText: z.string(),
      newText: z.string()
    })),
  },
  async ({ project, file, patches }) => {
    const result = await patchFile(project, file, patches);
    return { content: [{ type: "text", text: `✅ ${result.patchesApplied}/${result.totalPatches} patches applied` }] };
  }
);

// rtk_rollback
server.tool(
  "rtk_rollback",
  "Rollback file to backup",
  {
    project: z.string(),
    file: z.string(),
  },
  async ({ project, file }) => {
    await rollback(project, file);
    return { content: [{ type: "text", text: `↩️ File ${file} rolled back` }] };
  }
);

// rtk_git_status
server.tool(
  "rtk_git_status",
  "Check git status",
  {
    project: z.string(),
  },
  async ({ project }) => {
    const status = await gitStatus(project);
    const lines = [`📊 Git Status - Branch: ${status.branch}\n`];
    
    if (status.clean) {
      lines.push("✅ Working tree clean");
    } else {
      lines.push(`Modified: ${status.modified}, Added: ${status.added}, Deleted: ${status.deleted}\n`);
      status.files.slice(0, 10).forEach(f => {
        lines.push(`  ${f.status} ${f.file}`);
      });
    }
    
    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);

// rtk_git_diff
server.tool(
  "rtk_git_diff",
  "Show git diff",
  {
    project: z.string(),
    file: z.string().optional(),
  },
  async ({ project, file }) => {
    const diff = await gitDiff(project, file);
    
    if (!diff.hasDiff) {
      return { content: [{ type: "text", text: "No changes" }] };
    }
    
    return { content: [{ type: "text", text: `📝 Git Diff:\n\`\`\`diff\n${diff.diff}\n\`\`\`` }] };
  }
);

// rtk_git_commit
server.tool(
  "rtk_git_commit",
  "Commit changes",
  {
    project: z.string(),
    message: z.string(),
    files: z.array(z.string()).optional(),
  },
  async ({ project, message, files = [] }) => {
    const result = await gitCommit(project, message, files);
    return { content: [{ type: "text", text: `✅ Committed [${result.hash}]: ${result.message}` }] };
  }
);

// rtk_git_log
server.tool(
  "rtk_git_log",
  "Show git commits",
  {
    project: z.string(),
    limit: z.number().default(10).optional(),
  },
  async ({ project, limit = 10 }) => {
    const log = await gitLog(project, limit);
    const lines = [`📜 Recent commits (${log.count}):\n`];
    log.commits.forEach(c => {
      lines.push(`  ${c.hash} ${c.message}`);
    });
    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);

// rtk_index_stats
server.tool(
  "rtk_index_stats",
  "Check index status",
  {
    project: z.string(),
  },
  async ({ project }) => {
    const stats = getIndexStats(project);
    const text = stats.count > 0
      ? `📊 Project "${project}" indexed: ${stats.count} chunks`
      : `❌ Project "${project}" not indexed`;
    return { content: [{ type: "text", text }] };
  }
);

// rtk_cache_clear
server.tool(
  "rtk_cache_clear",
  "Clear cache and index",
  {
    project: z.string().optional(),
  },
  async ({ project }) => {
    const count = clearCache(project);
    clearIndex(project);
    const text = project
      ? `🗑️ Cache cleared for "${project}"`
      : `🗑️ All cache cleared`;
    return { content: [{ type: "text", text }] };
  }
);

// rtk_project_register
server.tool(
  "rtk_project_register",
  "Register new project",
  {
    name: z.string(),
    path: z.string(),
    techStack: z.string().optional(),
  },
  async ({ name, path, techStack }) => {
    await Projects.createProject(name, path, techStack);
    return { content: [{ type: "text", text: `✅ Project ${name} registered` }] };
  }
);

// rtk_task_status
server.tool(
  "rtk_task_status",
  "Get task status",
  {
    taskId: z.string(),
  },
  async ({ taskId }) => {
    const task = await Tasks.getTask(taskId);
    
    if (!task) {
      return { content: [{ type: "text", text: `❌ Task ${taskId} not found` }] };
    }
    
    const lines = [
      `📋 Task: ${task.id}`,
      `Project: ${task.project}`,
      `Goal: ${task.goal}`,
      `Status: ${task.status}`,
      `Progress: ${task.current_step}/${task.total_steps}`,
    ];
    
    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("RTK MCP Server running on stdio");
}

main().catch(console.error);
