import { vectorStore } from "./vector.js";

export async function semanticSearch(project, query, topK = 5) {
  const results = await vectorStore.search(project, query, topK);
  
  return results.map(r => ({
    file: r.metadata.file,
    startLine: r.metadata.startLine,
    endLine: r.metadata.endLine,
    score: r.score,
    snippet: r.text.slice(0, 200)
  }));
}

export function getIndexStats(project) {
  return vectorStore.getStats(project);
}

export function clearIndex(project) {
  vectorStore.clear(project);
}
