import { embedText } from "./embedder.js";
import fs from "fs";
import path from "path";

const STORAGE_DIR = "./rag/vector-db";

class VectorStore {
  constructor() {
    this.vectors = new Map(); // project -> [{id, vector, metadata}]
    this.loadFromDisk();
  }

  loadFromDisk() {
    if (!fs.existsSync(STORAGE_DIR)) return;
    try {
      const files = fs.readdirSync(STORAGE_DIR);
      for (const file of files) {
        if (!file.endsWith(".json")) continue;
        const project = file.replace(".json", "");
        const data = JSON.parse(fs.readFileSync(path.join(STORAGE_DIR, file), "utf-8"));
        this.vectors.set(project, data);
      }
    } catch (err) {
      console.error("Error loading vector store:", err.message);
    }
  }

  saveToDisk(project) {
    if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });
    const data = this.vectors.get(project) || [];
    fs.writeFileSync(path.join(STORAGE_DIR, `${project}.json`), JSON.stringify(data));
  }

  async addDocument(project, id, text, metadata = {}) {
    const vector = await embedText(text);
    if (!this.vectors.has(project)) this.vectors.set(project, []);
    this.vectors.get(project).push({ id, vector, metadata, text });
  }

  async search(project, query, topK = 5) {
    const docs = this.vectors.get(project);
    if (!docs || docs.length === 0) return [];

    const queryVector = await embedText(query);
    const scored = docs.map(doc => ({
      ...doc,
      score: cosineSimilarity(queryVector, doc.vector)
    }));

    return scored.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  clear(project) {
    if (project) {
      this.vectors.delete(project);
      const file = path.join(STORAGE_DIR, `${project}.json`);
      if (fs.existsSync(file)) fs.unlinkSync(file);
    } else {
      this.vectors.clear();
      if (fs.existsSync(STORAGE_DIR)) {
        fs.readdirSync(STORAGE_DIR).forEach(f => {
          fs.unlinkSync(path.join(STORAGE_DIR, f));
        });
      }
    }
  }

  getStats(project) {
    const docs = this.vectors.get(project);
    return { count: docs?.length || 0 };
  }
}

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB)) || 0;
}

export const vectorStore = new VectorStore();
