import { semanticSearch } from "../rag/search.js";
import fs from "fs";
import path from "path";

const MAX_CONTEXT_TOKENS = 8000;
const CHARS_PER_TOKEN = 4;

export async function buildContext(project, prompt, projectRoot) {
  const results = await semanticSearch(project, prompt, 5);
  
  if (results.length === 0) {
    return { files: [], summary: "No relevant context found", totalChars: 0 };
  }

  const files = [];
  let totalChars = 0;
  const maxChars = MAX_CONTEXT_TOKENS * CHARS_PER_TOKEN;

  for (const result of results) {
    if (totalChars >= maxChars) break;

    try {
      const filePath = path.join(projectRoot, result.file);
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");
      const snippet = lines.slice(result.startLine - 1, result.endLine).join("\n");
      
      const remaining = maxChars - totalChars;
      const finalSnippet = snippet.slice(0, remaining);
      
      files.push({
        file: result.file,
        startLine: result.startLine,
        endLine: result.endLine,
        score: result.score,
        content: finalSnippet
      });
      
      totalChars += finalSnippet.length;
    } catch (err) {
      // skip unreadable files
    }
  }

  const summary = `Found ${files.length} relevant files (${Math.round(totalChars / CHARS_PER_TOKEN)} tokens)`;
  
  return { files, summary, totalChars };
}

export function formatContext(context) {
  if (context.files.length === 0) return "";
  
  const parts = [`## 🧠 Relevant Context (${context.summary})\n`];
  
  for (const file of context.files) {
    const ext = file.file.split(".").pop();
    parts.push(`### 📄 ${file.file} (L${file.startLine}-${file.endLine}, score: ${file.score.toFixed(2)})`);
    parts.push(`\`\`\`${ext}\n${file.content}\n\`\`\``);
  }
  
  return parts.join("\n\n");
}
