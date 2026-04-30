import { query } from './connection.js';

export async function logActivity(project, action, message, filePath = null, taskId = null, metadata = null) {
  const sql = 'INSERT INTO activity_logs (project, task_id, action, file_path, message, metadata) VALUES (?, ?, ?, ?, ?, ?)';
  return await query(sql, [project, taskId, action, filePath, message, metadata ? JSON.stringify(metadata) : null]);
}

export async function getActivityLogs(project, limit = 50, action = null) {
  let sql = 'SELECT * FROM activity_logs WHERE project = ?';
  const params = [project];
  
  if (action) {
    sql += ' AND action = ?';
    params.push(action);
  }
  
  sql += ' ORDER BY created_at DESC LIMIT ?';
  params.push(limit);
  
  const rows = await query(sql, params);
  return rows.map(row => ({
    ...row,
    metadata: row.metadata ? JSON.parse(row.metadata) : null
  }));
}

export async function getTaskLogs(taskId) {
  const sql = 'SELECT * FROM activity_logs WHERE task_id = ? ORDER BY created_at ASC';
  const rows = await query(sql, [taskId]);
  return rows.map(row => ({
    ...row,
    metadata: row.metadata ? JSON.parse(row.metadata) : null
  }));
}
