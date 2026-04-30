import fs from "fs";
import path from "path";

const CHUNK_SIZE = 2000;

export function chunkCode(content, filePath) {
  const lines = content.split("\n");
  const chunks = [];
  let current = "";
  let startLine = 1;

  for (let i = 0; i < lines.length; i++) {
    if (current.length + lines[i].length > CHUNK_SIZE && current) {
      chunks.push({ text: current, file: filePath, startLine, endLine: i });
      current = "";
      startLine = i + 1;
    }
    current += lines[i] + "\n";
  }

  if (current) chunks.push({ text: current, file: filePath, startLine, endLine: lines.length });
  return chunks;
}

export async function embedText(text) {
  // Simple embedding: TF-IDF-like vector
  const words = text.toLowerCase().match(/\w+/g) || [];
  const freq = {};
  words.forEach(w => freq[w] = (freq[w] || 0) + 1);
  
  const vocab = Object.keys(freq).sort();
  const vector = new Array(128).fill(0);
  
  vocab.forEach((word, idx) => {
    const pos = Math.abs(hashCode(word)) % 128;
    vector[pos] += freq[word];
  });
  
  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  return vector.map(v => norm ? v / norm : 0);
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
