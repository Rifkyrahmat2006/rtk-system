import fs from "fs";
import path from "path";
import { chunkCode } from "../rag/embedder.js";
import { vectorStore } from "../rag/vector.js";

const IGNORE = new Set(["node_modules", ".git", "vendor", ".dist", "dist", "build"]);
const CODE_EXTS = new Set([".js", ".ts", ".php", ".py", ".json", ".md", ".yaml", ".yml", ".html", ".css", ".vue"]);

export async function indexProject(projectName, projectPath) {
  let indexed = 0;
  let chunks = 0;

  async function indexFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const relative = path.relative(projectPath, filePath);
      const fileChunks = chunkCode(content, relative);
      
      for (const chunk of fileChunks) {
        const id = `${relative}:${chunk.startLine}-${chunk.endLine}`;
        await vectorStore.addDocument(projectName, id, chunk.text, {
          file: relative,
          startLine: chunk.startLine,
          endLine: chunk.endLine
        });
        chunks++;
      }
      indexed++;
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
      console.error("Index error:", err.message);
    }
  }

  await index(projectPath);
  
  // Save to disk
  vectorStore.saveToDisk(projectName);
  
  return { files: indexed, chunks };
}
