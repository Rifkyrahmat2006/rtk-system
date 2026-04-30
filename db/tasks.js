import { query } from './connection.js';
import { randomUUID } from 'crypto';

export async function createTask(project, goal, steps = []) {
  const id = randomUUID();
  const sql = 'INSERT INTO tasks (id, project, goal, status, total_steps, steps) VALUES (?, ?, ?, ?, ?, ?)';
  await query(sql, [id, project, goal, 'pending', steps.length, JSON.stringify(steps)]);
  return id;
}

export async function getTask(id) {
  const sql = 'SELECT * FROM tasks WHERE id = ?';
  const rows = await query(sql, [id]);
  if (rows[0]) {
    rows[0].steps = JSON.parse(rows[0].steps || '[]');
    rows[0].result = JSON.parse(rows[0].result || 'null');
  }
  return rows[0];
}

export async function updateTaskStatus(id, status, currentStep = null, result = null, error = null) {
  let sql = 'UPDATE tasks SET status = ?, updated_at = NOW()';
  const params = [status];
  
  if (currentStep !== null) {
    sql += ', current_step = ?';
    params.push(currentStep);
  }
  
  if (result !== null) {
    sql += ', result = ?';
    params.push(JSON.stringify(result));
  }
  
  if (error !== null) {
    sql += ', error = ?';
    params.push(error);
  }
  
  if (status === 'completed' || status === 'failed') {
    sql += ', completed_at = NOW()';
  }
  
  sql += ' WHERE id = ?';
  params.push(id);
  
  return await query(sql, params);
}

export async function getTasksByProject(project, limit = 10) {
  const sql = 'SELECT * FROM tasks WHERE project = ? ORDER BY created_at DESC LIMIT ?';
  const rows = await query(sql, [project, limit]);
  return rows.map(row => ({
    ...row,
    steps: JSON.parse(row.steps || '[]'),
    result: JSON.parse(row.result || 'null')
  }));
}

export async function getActiveTasks(project = null) {
  let sql = 'SELECT * FROM tasks WHERE status IN (?, ?)';
  const params = ['pending', 'in-progress'];
  
  if (project) {
    sql += ' AND project = ?';
    params.push(project);
  }
  
  sql += ' ORDER BY created_at DESC';
  const rows = await query(sql, params);
  return rows.map(row => ({
    ...row,
    steps: JSON.parse(row.steps || '[]'),
    result: JSON.parse(row.result || 'null')
  }));
}
