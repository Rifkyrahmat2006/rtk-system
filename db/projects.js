import { query } from './connection.js';

export async function createProject(name, path, techStack = null) {
  const sql = 'INSERT INTO projects (name, path, tech_stack) VALUES (?, ?, ?)';
  return await query(sql, [name, path, techStack]);
}

export async function getProject(name) {
  const sql = 'SELECT * FROM projects WHERE name = ?';
  const rows = await query(sql, [name]);
  return rows[0];
}

export async function getAllProjects() {
  const sql = 'SELECT * FROM projects ORDER BY created_at DESC';
  return await query(sql);
}

export async function updateProjectIndexTime(name) {
  const sql = 'UPDATE projects SET last_indexed = NOW() WHERE name = ?';
  return await query(sql, [name]);
}

export async function deleteProject(name) {
  const sql = 'DELETE FROM projects WHERE name = ?';
  return await query(sql, [name]);
}
