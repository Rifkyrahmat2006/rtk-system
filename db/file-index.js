import { query } from './connection.js';
import crypto from 'crypto';

export function hashFile(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

export async function trackFileIndex(project, filePath, fileHash, embeddingId, chunkCount) {
  const sql = `
    INSERT INTO file_index (project, file_path, file_hash, embedding_id, chunk_count, last_indexed)
    VALUES (?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE 
      file_hash = VALUES(file_hash),
      embedding_id = VALUES(embedding_id),
      chunk_count = VALUES(chunk_count),
      last_indexed = NOW()
  `;
  return await query(sql, [project, filePath, fileHash, embeddingId, chunkCount]);
}

export async function getFileIndex(project, filePath) {
  const sql = 'SELECT * FROM file_index WHERE project = ? AND file_path = ?';
  const rows = await query(sql, [project, filePath]);
  return rows[0];
}

export async function getChangedFiles(project, fileList) {
  const sql = 'SELECT file_path, file_hash FROM file_index WHERE project = ?';
  const indexed = await query(sql, [project]);
  const indexedMap = new Map(indexed.map(f => [f.file_path, f.file_hash]));
  
  return fileList.filter(({ path, hash }) => {
    const existing = indexedMap.get(path);
    return !existing || existing !== hash;
  });
}

export async function updateIndexStats(project, totalFiles, totalChunks, isFullIndex = true) {
  const field = isFullIndex ? 'last_full_index' : 'last_incremental_index';
  const sql = `
    INSERT INTO index_stats (project, total_files, total_chunks, ${field})
    VALUES (?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
      total_files = VALUES(total_files),
      total_chunks = VALUES(total_chunks),
      ${field} = NOW()
  `;
  return await query(sql, [project, totalFiles, totalChunks]);
}

export async function getIndexStats(project) {
  const sql = 'SELECT * FROM index_stats WHERE project = ?';
  const rows = await query(sql, [project]);
  return rows[0];
}
