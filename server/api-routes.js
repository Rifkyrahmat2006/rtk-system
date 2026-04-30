import express from 'express';
import * as Projects from '../db/projects.js';
import * as Tasks from '../db/tasks.js';
import * as ActivityLogs from '../db/activity-logs.js';
import * as FileIndex from '../db/file-index.js';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Get all projects with stats
router.get('/projects', async (req, res) => {
  try {
    const projects = await Projects.getAllProjects();
    
    // Add stats for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (p) => {
        const stats = await FileIndex.getIndexStats(p.name);
        return {
          ...p,
          total_files: stats?.total_files || 0,
          total_chunks: stats?.total_chunks || 0
        };
      })
    );
    
    res.json(projectsWithStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new project
router.post('/projects', async (req, res) => {
  try {
    const { name, path, techStack } = req.body;
    await Projects.createProject(name, path, techStack);
    res.json({ success: true, message: 'Project created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tasks
router.get('/tasks', async (req, res) => {
  try {
    const { project, status } = req.query;
    
    let tasks = [];
    if (project) {
      tasks = await Tasks.getTasksByProject(project, 100);
    } else {
      // Get all tasks from all projects
      const projects = await Projects.getAllProjects();
      for (const p of projects) {
        const projectTasks = await Tasks.getTasksByProject(p.name, 100);
        tasks.push(...projectTasks);
      }
    }
    
    if (status) {
      tasks = tasks.filter(t => t.status === status);
    }
    
    res.json(tasks);
  } catch (error) {
    console.error('Tasks error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get activity logs
router.get('/logs', async (req, res) => {
  try {
    const { project, action, limit = 50 } = req.query;
    
    if (project) {
      const logs = await ActivityLogs.getActivityLogs(project, parseInt(limit), action);
      res.json(logs);
    } else {
      // Get logs from all projects
      const projects = await Projects.getAllProjects();
      const allLogs = [];
      
      for (const p of projects) {
        const logs = await ActivityLogs.getActivityLogs(p.name, parseInt(limit), action);
        allLogs.push(...logs);
      }
      
      // Sort by date and limit
      allLogs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      res.json(allLogs.slice(0, parseInt(limit)));
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get config
router.get('/config', async (req, res) => {
  try {
    const envPath = join(__dirname, '..', '.env');
    const envContent = readFileSync(envPath, 'utf-8');
    
    const config = {
      port: process.env.PORT || 3000,
      db: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        database: process.env.DB_NAME || 'rtk_system'
      }
    };
    
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save config
router.post('/config', async (req, res) => {
  try {
    const { port, apiKey, db } = req.body;
    
    let envContent = '';
    if (apiKey) envContent += `RTK_API_KEY=${apiKey}\n`;
    envContent += `PORT=${port}\n\n`;
    envContent += `# MySQL Database Configuration\n`;
    envContent += `DB_HOST=${db.host}\n`;
    envContent += `DB_PORT=${db.port}\n`;
    envContent += `DB_USER=${db.user}\n`;
    if (db.password) envContent += `DB_PASSWORD=${db.password}\n`;
    envContent += `DB_NAME=${db.database}\n`;
    
    const envPath = join(__dirname, '..', '.env');
    writeFileSync(envPath, envContent);
    
    res.json({ success: true, message: 'Config saved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available tools
router.get('/tools', async (req, res) => {
  const tools = [
    { name: 'rtk_ask', description: 'Natural language query with RAG' },
    { name: 'rtk_semantic_search', description: 'Semantic code search' },
    { name: 'rtk_explore', description: 'Browse project structure' },
    { name: 'rtk_search', description: 'Keyword search' },
    { name: 'rtk_read', description: 'Read file contents' },
    { name: 'rtk_write', description: 'Write/overwrite files' },
    { name: 'rtk_patch', description: 'Apply patches to files' },
    { name: 'rtk_rollback', description: 'Rollback file changes' },
    { name: 'rtk_git_status', description: 'Check git status' },
    { name: 'rtk_git_diff', description: 'Show git diff' },
    { name: 'rtk_git_commit', description: 'Commit changes' },
    { name: 'rtk_git_log', description: 'View git commits' },
    { name: 'rtk_project_list', description: 'List all projects' },
    { name: 'rtk_task_status', description: 'Get task status' },
    { name: 'rtk_task_list', description: 'List tasks' },
    { name: 'rtk_activity_logs', description: 'View activity logs' },
    { name: 'rtk_index_stats', description: 'Check index status' },
    { name: 'rtk_cache_clear', description: 'Clear cache & index' }
  ];
  
  res.json(tools);
});

export default router;
