import express from "express";
import dotenv from "dotenv";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { orchestrator, exploreAgent, searchAgent, readerAgent, clearCache } from "../agents/orchestrator.js";
import { semanticSearch, getIndexStats, clearIndex } from "../rag/search.js";
import { writeFile, patchFile, deleteFile, rollback, previewDiff } from "../tools/code-modifier.js";
import { gitStatus, gitDiff, gitCommit, gitBranch, gitLog, gitPull, gitPush } from "../tools/git-tools.js";
import { registerMonitoringTools } from "./monitoring-tools.js";
import { initDatabase } from "../db/init.js";
import apiRoutes from "./api-routes.js";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.RTK_API_KEY;

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, '..', 'public')));

// ── Auth Middleware ───────────────────────────────────────────────
app.use((req, res, next) => {
  // Skip auth for dashboard, health, and API routes
  if (req.path === '/' || 
      req.path.startsWith('/css') || 
      req.path.startsWith('/js') || 
      req.path === '/health' ||
      req.path.startsWith('/api')) {
    return next();
  }
  
  // Check API key for MCP endpoint
  if (!API_KEY) return next();
  const key = req.headers["x-api-key"];
  if (key !== API_KEY) return res.status(401).json({ error: "Unauthorized" });
  next();
});

// ── Formatters ────────────────────────────────────────────────────
function formatTree(tree, indent = "") {
  return tree.map(n => {
    const icon = n.type === "dir" ? "📁" : "📄";
    const line = `${indent}${icon} ${n.path}`;
    const children = n.children?.length ? "\n" + formatTree(n.children, indent + "  ") : "";
    return line + children;
  }).join("\n");
}

function formatSearch(result) {
  if (!result.results.length) return `Tidak ada hasil untuk "${result.keyword}" (${result.scanned} file di-scan)`;
  const lines = [`🔍 Hasil pencarian "${result.keyword}" (${result.results.length} file dari ${result.scanned} di-scan):\n`];
  for (const r of result.results) {
    lines.push(`📄 ${r.file}`);
    for (const m of r.matches.slice(0, 5)) {
      lines.push(`   L${m.line}: ${m.text}`);
    }
    if (r.matches.length > 5) lines.push(`   ... +${r.matches.length - 5} baris lagi`);
  }
  return lines.join("\n");
}

function buildProgressCallback(server, progressToken) {
  let step = 0;
  return (agent, message) => {
    step++;
    if (progressToken !== undefined) {
      server.server.notification({
        method: "notifications/progress",
        params: { progressToken, progress: step, total: 10, message: `[${agent.toUpperCase()}] ${message}` },
      }).catch(() => {});
    }
  };
}

// ── MCP Server Factory ────────────────────────────────────────────
function createMcpServer() {
  const server = new McpServer({ name: "rtk-system", version: "5.0.0" });

  // Register monitoring tools
  registerMonitoringTools(server);

  // ── rtk_ask ──
  server.tool(
    "rtk_ask",
    "Tanya RTK tentang project dengan natural language. Orchestrator akan menjalankan agent yang sesuai.",
    {
      project: z.string().describe("Nama project (contoh: smartani)"),
      prompt: z.string().describe("Pertanyaan atau perintah dalam bahasa natural"),
      _meta: z.object({ progressToken: z.union([z.string(), z.number()]).optional() }).optional(),
    },
    async ({ project, prompt, _meta }) => {
      const onProgress = buildProgressCallback(server, _meta?.progressToken);
      const results = await orchestrator(project, prompt, onProgress);
      const parts = [];

      if (results.semantic) {
        parts.push(results.semantic.formatted);
      }
      if (results.explore) {
        parts.push(`## 📁 Struktur Project: ${project}\n\`\`\`\n${formatTree(results.explore.tree)}\n\`\`\``);
      }
      if (results.search) {
        parts.push(`## 🔍 Pencarian\n${formatSearch(results.search)}`);
      }
      if (results.read) {
        const ext = results.read.file.split(".").pop();
        const truncatedNote = results.read.truncated
          ? `\n> ⚠️ Truncated: ${results.read.lines} dari ${results.read.totalLines} baris`
          : "";
        parts.push(`## 📄 ${results.read.file} (${results.read.lines}/${results.read.totalLines} baris)${truncatedNote}\n\`\`\`${ext}\n${results.read.content}\n\`\`\``);
      }

      return { content: [{ type: "text", text: parts.join("\n\n") || "Tidak ada hasil." }] };
    }
  );

  // ── rtk_explore ──
  server.tool(
    "rtk_explore",
    "Explore struktur folder dan file dari sebuah project",
    {
      project: z.string(),
      depth: z.number().min(1).max(5).default(2).describe("Kedalaman folder (default: 2)"),
      _meta: z.object({ progressToken: z.union([z.string(), z.number()]).optional() }).optional(),
    },
    async ({ project, depth, _meta }) => {
      const onProgress = buildProgressCallback(server, _meta?.progressToken);
      const result = await exploreAgent(project, { depth }, onProgress);
      const text = `## 📁 ${project} (depth: ${depth})\nRoot: ${result.root}\n\n${formatTree(result.tree)}`;
      return { content: [{ type: "text", text }] };
    }
  );

  // ── rtk_search ──
  server.tool(
    "rtk_search",
    "Cari keyword di seluruh file source code project",
    {
      project: z.string(),
      keyword: z.string().describe("Keyword yang dicari"),
      _meta: z.object({ progressToken: z.union([z.string(), z.number()]).optional() }).optional(),
    },
    async ({ project, keyword, _meta }) => {
      const onProgress = buildProgressCallback(server, _meta?.progressToken);
      const result = await searchAgent(project, keyword, onProgress);
      return { content: [{ type: "text", text: formatSearch(result) }] };
    }
  );

  // ── rtk_read ──
  server.tool(
    "rtk_read",
    "Baca isi file dari project. Support line range dan batas karakter.",
    {
      project: z.string(),
      file: z.string().describe("Path file relatif dari root project"),
      lineStart: z.number().min(1).optional().describe("Baris mulai (opsional)"),
      lineEnd: z.number().min(1).optional().describe("Baris akhir (opsional)"),
      maxChars: z.number().min(1000).max(200000).default(80000).optional().describe("Batas karakter (default: 80000)"),
      _meta: z.object({ progressToken: z.union([z.string(), z.number()]).optional() }).optional(),
    },
    async ({ project, file, lineStart, lineEnd, maxChars = 80000, _meta }) => {
      const onProgress = buildProgressCallback(server, _meta?.progressToken);
      const result = await readerAgent(project, file, onProgress, { maxChars, lineStart, lineEnd });
      const ext = file.split(".").pop();
      const truncatedNote = result.truncated
        ? `\n> ⚠️ Truncated: menampilkan ${result.lines} dari ${result.totalLines} baris. Gunakan lineStart/lineEnd untuk baca bagian tertentu.`
        : "";
      const rangeInfo = result.rangeNote ? ` ${result.rangeNote}` : "";
      const text = `## 📄 ${file} (${result.lines}/${result.totalLines} baris${rangeInfo})${truncatedNote}\n\`\`\`${ext}\n${result.content}\n\`\`\``;
      return { content: [{ type: "text", text }] };
    }
  );

  // ── rtk_semantic_search ──
  server.tool(
    "rtk_semantic_search",
    "Semantic search menggunakan RAG (harus index dulu dengan rtk_index)",
    {
      project: z.string(),
      query: z.string().describe("Query dalam natural language"),
      topK: z.number().min(1).max(20).default(5).optional(),
      _meta: z.object({ progressToken: z.union([z.string(), z.number()]).optional() }).optional(),
    },
    async ({ project, query, topK = 5, _meta }) => {
      const onProgress = buildProgressCallback(server, _meta?.progressToken);
      onProgress?.("semantic", `Searching: "${query}"`);
      
      const results = await semanticSearch(project, query, topK);
      if (results.length === 0) {
        return { content: [{ type: "text", text: `❌ No results. Index project first: node indexer/index-project.js ${project}` }] };
      }

      const lines = [`🧠 Semantic Search: "${query}" (${results.length} results)\n`];
      for (const r of results) {
        lines.push(`📄 ${r.file} (L${r.startLine}-${r.endLine}) - score: ${r.score.toFixed(2)}`);
        lines.push(`   ${r.snippet.slice(0, 150)}...\n`);
      }
      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );

  // ── rtk_index ──
  server.tool(
    "rtk_index",
    "Index project untuk RAG semantic search (jalankan sekali per project)",
    {
      project: z.string(),
    },
    async ({ project }) => {
      return { content: [{ type: "text", text: `⚠️ Run manually: node indexer/index-project.js ${project}` }] };
    }
  );

  // ── rtk_index_stats ──
  server.tool(
    "rtk_index_stats",
    "Cek status index RAG untuk project",
    {
      project: z.string(),
    },
    async ({ project }) => {
      const stats = getIndexStats(project);
      const text = stats.count > 0
        ? `📊 Project "${project}" indexed: ${stats.count} chunks`
        : `❌ Project "${project}" not indexed. Run: node indexer/index-project.js ${project}`;
      return { content: [{ type: "text", text }] };
    }
  );

  // ── rtk_cache_clear ──
  server.tool(
    "rtk_cache_clear",
    "Hapus cache explore dan search untuk project tertentu atau semua project",
    {
      project: z.string().optional().describe("Nama project (kosongkan untuk clear semua cache)"),
    },
    async ({ project }) => {
      const count = clearCache(project);
      clearIndex(project);
      const text = project
        ? `🗑️ Cache & index untuk project "${project}" dihapus (${count} entry)`
        : `🗑️ Semua cache & index dihapus (${count} entry)`;
      return { content: [{ type: "text", text }] };
    }
  );

  // ── rtk_write ──
  server.tool(
    "rtk_write",
    "Write atau overwrite file dengan content baru (dengan backup otomatis)",
    {
      project: z.string(),
      file: z.string().describe("Path file relatif dari root project"),
      content: z.string().describe("Content file yang akan ditulis"),
      preview: z.boolean().optional().describe("Preview diff sebelum write (default: false)"),
    },
    async ({ project, file, content, preview = false }) => {
      if (preview) {
        const diff = await previewDiff(project, file, content);
        const lines = [`📝 Preview perubahan untuk ${file}:\n`];
        lines.push(`Total perubahan: ${diff.changes} baris\n`);
        diff.diff.slice(0, 20).forEach(d => {
          const prefix = d.type === "added" ? "+ " : "- ";
          lines.push(`${prefix}L${d.line}: ${d.text}`);
        });
        if (diff.diff.length > 20) lines.push(`\n... +${diff.diff.length - 20} perubahan lagi`);
        return { content: [{ type: "text", text: lines.join("\n") }] };
      }
      
      const result = await writeFile(project, file, content);
      const text = `✅ File ${file} berhasil ditulis (${result.size} chars)${result.backup ? " [backup created]" : ""}`;
      return { content: [{ type: "text", text }] };
    }
  );

  // ── rtk_patch ──
  server.tool(
    "rtk_patch",
    "Apply patches ke file (find & replace multiple)",
    {
      project: z.string(),
      file: z.string().describe("Path file relatif dari root project"),
      patches: z.array(z.object({
        oldText: z.string(),
        newText: z.string()
      })).describe("Array of patches to apply"),
    },
    async ({ project, file, patches }) => {
      const result = await patchFile(project, file, patches);
      const text = `✅ ${result.patchesApplied}/${result.totalPatches} patches applied to ${file} [backup: ${result.backup}]`;
      return { content: [{ type: "text", text }] };
    }
  );

  // ── rtk_rollback ──
  server.tool(
    "rtk_rollback",
    "Rollback file ke backup terakhir",
    {
      project: z.string(),
      file: z.string().describe("Path file relatif dari root project"),
    },
    async ({ project, file }) => {
      const result = await rollback(project, file);
      const text = `↩️ File ${file} berhasil di-rollback ke backup`;
      return { content: [{ type: "text", text }] };
    }
  );

  // ── rtk_git_status ──
  server.tool(
    "rtk_git_status",
    "Check git status dari project",
    {
      project: z.string(),
    },
    async ({ project }) => {
      const status = await gitStatus(project);
      const lines = [`📊 Git Status - Branch: ${status.branch}\n`];
      if (status.clean) {
        lines.push("✅ Working tree clean");
      } else {
        lines.push(`Modified: ${status.modified}, Added: ${status.added}, Deleted: ${status.deleted}, Untracked: ${status.untracked}\n`);
        status.files.slice(0, 20).forEach(f => {
          lines.push(`  ${f.status} ${f.file}`);
        });
        if (status.files.length > 20) lines.push(`\n... +${status.files.length - 20} files`);
      }
      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );

  // ── rtk_git_diff ──
  server.tool(
    "rtk_git_diff",
    "Show git diff untuk file atau semua changes",
    {
      project: z.string(),
      file: z.string().optional().describe("Path file (optional, default: all changes)"),
    },
    async ({ project, file }) => {
      const diff = await gitDiff(project, file);
      if (!diff.hasDiff) {
        return { content: [{ type: "text", text: `No changes in ${diff.file}` }] };
      }
      const text = `📝 Git Diff - ${diff.file}:\n\`\`\`diff\n${diff.diff}\n\`\`\``;
      return { content: [{ type: "text", text }] };
    }
  );

  // ── rtk_git_commit ──
  server.tool(
    "rtk_git_commit",
    "Commit changes dengan message",
    {
      project: z.string(),
      message: z.string().describe("Commit message"),
      files: z.array(z.string()).optional().describe("Specific files to commit (optional, default: all)"),
    },
    async ({ project, message, files = [] }) => {
      const result = await gitCommit(project, message, files);
      const text = `✅ Committed [${result.hash}]: ${result.message} (${result.files} files)`;
      return { content: [{ type: "text", text }] };
    }
  );

  // ── rtk_git_log ──
  server.tool(
    "rtk_git_log",
    "Show recent git commits",
    {
      project: z.string(),
      limit: z.number().min(1).max(50).default(10).optional(),
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

  return server;
}

// ── Routes ─────────────────────────────────────────────────────────
// Dashboard
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, '..', 'public', 'index.html'));
});

// API Routes
app.use("/api", apiRoutes);

// MCP Route
app.all("/mcp", async (req, res) => {
  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await server.connect(transport);
  await transport.handleRequest(req, res);
});

// Health Check
app.get("/health", (_, res) => res.json({ status: "ok", version: "5.0.0" }));

// Initialize database on startup
initDatabase().catch(err => {
  console.warn('⚠️ Database initialization failed:', err.message);
  console.warn('   Server will run without database features');
});

app.listen(PORT, () => {
  console.log(`\n🚀 RTK v5.0 Server Started`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📊 Dashboard:  http://localhost:${PORT}`);
  console.log(`🔌 MCP Server: http://localhost:${PORT}/mcp`);
  console.log(`💚 Health:     http://localhost:${PORT}/health`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🛠️  Tools: 18 MCP tools available`);
  console.log(`🔐 Auth: ${API_KEY ? "enabled (x-api-key)" : "disabled"}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
});
