import fs from "fs";
import path from "path";
import projects from "../config/projects.json" with { type: "json" };
import { chunkCode } from "../rag/embedder.js";
import { vectorStore } from "../rag/vector.js";

const IGNORE = new Set(["node_modules", ".git", "vendor", ".dist", "dist", "build"]);
const CODE_EXTS = new Set([".js", ".ts", ".php", ".py", ".json", ".md", ".yaml", ".yml", ".html", ".css"]);

const project = process.argv[2];
if (!project) {
  console.log("Gunakan: node indexer/index-project.js <project_name>");
  process.exit(1);
}

const projectPath = projects.projects[project];
if (!projectPath) {
  console.log("Project tidak ditemukan");
  process.exit(1);
}

let indexed = 0;
let chunks = 0;

async function indexFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const relative = path.relative(projectPath, filePath);
    const fileChunks = chunkCode(content, relative);
    
    for (const chunk of fileChunks) {
      const id = `${relative}:${chunk.startLine}-${chunk.endLine}`;
      await vectorStore.addDocument(project, id, chunk.text, {
        file: relative,
        startLine: chunk.startLine,
        endLine: chunk.endLine
      });
      chunks++;
    }
    indexed++;
    if (indexed % 10 === 0) console.log(`Indexed ${indexed} files, ${chunks} chunks...`);
  } catch (err) {
    // skip unreadable files
  }
}

async function index(dir) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (IGNORE.has(file)) continue;
      const full = path.resolve(dir, file);
      if (!full.startsWith(path.resolve(projectPath))) continue;

      if (fs.statSync(full).isDirectory()) {
        await index(full);
      } else if (CODE_EXTS.has(path.extname(file))) {
        await indexFile(full);
      }
    }
  } catch (err) {
    console.log("Error:", err.message);
  }
}

console.log(`🔍 Indexing project: ${project}`);
console.log(`📁 Path: ${projectPath}\n`);

await index(projectPath);

console.log(`\n✅ Done! Indexed ${indexed} files, ${chunks} chunks`);
const stats = vectorStore.getStats(project);
console.log(`📊 Vector store: ${stats.count} documents`);

// Save to disk
console.log(`💾 Saving to disk...`);
vectorStore.saveToDisk(project);
console.log(`✅ Saved!`);
