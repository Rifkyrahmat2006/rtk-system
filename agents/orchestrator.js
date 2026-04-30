import fs from "fs";
import path from "path";
import projects from "../config/projects.json" with { type: "json" };
import { buildContext, formatContext } from "../rag/context-builder.js";
import { getIndexStats } from "../rag/search.js";

const IGNORE = new Set(["node_modules", ".git", "vendor", ".dist", "dist", "build"]);

function resolveProject(project) {
  const p = projects.projects[project];
  if (!p) throw new Error(`Project "${project}" tidak ditemukan`);
  return path.resolve(p);
}

// ── Simple TTL Cache ──────────────────────────────────────────────
const cache = new Map();
const CACHE_TTL = 60_000; // 60 seconds

function cacheGet(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { cache.delete(key); return null; }
  return entry.data;
}

function cacheSet(key, data) {
  cache.set(key, { ts: Date.now(), data });
}

export function clearCache(project) {
  if (!project) {
    const count = cache.size;
    cache.clear();
    return count;
  }
  let count = 0;
  for (const key of cache.keys()) {
    if (key.includes(`:${project}:`)) { cache.delete(key); count++; }
  }
  return count;
}

// ── Explorer Agent ──────────────────────────────────────────────
export async function exploreAgent(project, { depth = 2 } = {}, onProgress) {
  const cacheKey = `explore:${project}:${depth}`;
  const cached = cacheGet(cacheKey);
  if (cached) {
    onProgress?.("explore", `Cache hit: struktur project ${project}`);
    return cached;
  }

  const root = resolveProject(project);
  onProgress?.("explore", `Scanning struktur project: ${project}`);

  function scan(dir, level) {
    if (level > depth) return [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const result = [];
    for (const e of entries) {
      if (IGNORE.has(e.name)) continue;
      const rel = path.relative(root, path.join(dir, e.name));
      if (e.isDirectory()) {
        result.push({ type: "dir", path: rel, children: scan(path.join(dir, e.name), level + 1) });
      } else {
        result.push({ type: "file", path: rel });
      }
    }
    return result;
  }

  const tree = scan(root, 0);
  onProgress?.("explore", `Ditemukan ${tree.length} item di root`);
  const result = { project, root, tree };
  cacheSet(cacheKey, result);
  return result;
}

// ── Search Agent ─────────────────────────────────────────────────
export async function searchAgent(project, keyword, onProgress) {
  const cacheKey = `search:${project}:${keyword.toLowerCase()}`;
  const cached = cacheGet(cacheKey);
  if (cached) {
    onProgress?.("search", `Cache hit: "${keyword}"`);
    return cached;
  }

  const root = resolveProject(project);
  onProgress?.("search", `Mencari "${keyword}" di project ${project}...`);

  const results = [];
  let scanned = 0;

  function scan(dir) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (IGNORE.has(e.name)) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        scan(full);
      } else if (/\.(js|ts|php|py|json|md|env|yaml|yml|html|css|blade\.php)$/.test(e.name)) {
        scanned++;
        try {
          const content = fs.readFileSync(full, "utf-8");
          const lines = content.split("\n");
          const matches = [];
          lines.forEach((line, i) => {
            if (line.toLowerCase().includes(keyword.toLowerCase())) {
              matches.push({ line: i + 1, text: line.trim() });
            }
          });
          if (matches.length) {
            results.push({ file: path.relative(root, full), matches });
          }
        } catch { /* skip unreadable */ }
      }
    }
  }

  scan(root);
  onProgress?.("search", `Selesai scan ${scanned} file, ditemukan ${results.length} file dengan match`);
  const result = { keyword, scanned, results };
  cacheSet(cacheKey, result);
  return result;
}

// ── Reader Agent ──────────────────────────────────────────────────
export async function readerAgent(project, filePath, onProgress, { maxChars = 80000, lineStart, lineEnd } = {}) {
  const root = resolveProject(project);
  const resolved = path.resolve(root, filePath);

  if (!resolved.startsWith(root + path.sep) && resolved !== root) {
    throw new Error(`Access denied: ${filePath}`);
  }

  onProgress?.("read", `Membaca file: ${filePath}`);
  const raw = fs.readFileSync(resolved, "utf-8");
  const allLines = raw.split("\n");
  const totalLines = allLines.length;

  // Line range slicing
  let content;
  let rangeNote = "";
  if (lineStart !== undefined || lineEnd !== undefined) {
    const from = Math.max(1, lineStart ?? 1);
    const to = Math.min(totalLines, lineEnd ?? totalLines);
    content = allLines.slice(from - 1, to).join("\n");
    rangeNote = ` [baris ${from}–${to}]`;
  } else {
    content = raw;
  }

  // Char limit
  let truncated = false;
  if (content.length > maxChars) {
    content = content.slice(0, maxChars);
    truncated = true;
  }

  const lines = content.split("\n").length;
  onProgress?.("read", `File dibaca: ${lines} baris${truncated ? ` (truncated dari ${totalLines})` : ""}${rangeNote}`);
  return { file: filePath, lines, totalLines, truncated, rangeNote, content };
}

// ── Orchestrator ──────────────────────────────────────────────────
export async function orchestrator(project, prompt, onProgress) {
  onProgress?.("orchestrator", `Menganalisis prompt: "${prompt}"`);

  const lower = prompt.toLowerCase();
  const results = {};
  const tasks = [];

  // Check if RAG index exists
  const stats = getIndexStats(project);
  const hasIndex = stats.count > 0;

  if (hasIndex && (/cari|search|temukan|where|dimana|bagaimana|cara|implementasi|explain/.test(lower))) {
    tasks.push("semantic");
  }
  if (/struktur|explore|folder|direktori|tree|list file/.test(lower)) tasks.push("explore");
  if (/cari|search|temukan|where|dimana|keyword|fungsi|function|class/.test(lower) && !hasIndex) tasks.push("search");
  if (/baca|read|isi|content|tampilkan|show/.test(lower)) tasks.push("read");
  if (tasks.length === 0) tasks.push(hasIndex ? "semantic" : "explore");

  onProgress?.("orchestrator", `Menjalankan ${tasks.length} agent: ${tasks.join(", ")}`);

  const keywordMatch = prompt.match(/["']([^"']+)["']/) ||
    prompt.match(/(?:cari|search|temukan|find)\s+(\S+)/i);
  const keyword = keywordMatch?.[1] ?? prompt.split(" ").pop();

  const fileMatch = prompt.match(/(?:baca|read|tampilkan|show)\s+["']?([^\s"']+)["']?/i);
  const filePath = fileMatch?.[1];

  for (const task of tasks) {
    if (task === "semantic") {
      onProgress?.("orchestrator", `→ RAG Semantic Search dimulai`);
      const root = resolveProject(project);
      const context = await buildContext(project, prompt, root);
      results.semantic = { context, formatted: formatContext(context) };
    }
    if (task === "explore") {
      onProgress?.("orchestrator", "→ Explorer Agent dimulai");
      results.explore = await exploreAgent(project, { depth: 2 }, onProgress);
    }
    if (task === "search") {
      onProgress?.("orchestrator", `→ Search Agent dimulai (keyword: "${keyword}")`);
      results.search = await searchAgent(project, keyword, onProgress);
    }
    if (task === "read" && filePath) {
      onProgress?.("orchestrator", `→ Reader Agent dimulai (file: "${filePath}")`);
      results.read = await readerAgent(project, filePath, onProgress);
    }
  }

  onProgress?.("orchestrator", "Semua agent selesai, menyusun hasil...");
  return results;
}
