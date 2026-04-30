import { z } from 'zod';
import * as Tasks from '../db/tasks.js';
import * as ActivityLogs from '../db/activity-logs.js';
import * as Projects from '../db/projects.js';
import * as FileIndex from '../db/file-index.js';

export function registerMonitoringTools(server) {
  
  // ── rtk_task_status ──
  server.tool(
    'rtk_task_status',
    'Get status of a specific task',
    {
      taskId: z.string().describe('Task ID'),
    },
    async ({ taskId }) => {
      const task = await Tasks.getTask(taskId);
      if (!task) {
        return { content: [{ type: 'text', text: `❌ Task ${taskId} not found` }] };
      }
      
      const lines = [
        `📋 Task: ${task.id}`,
        `Project: ${task.project}`,
        `Goal: ${task.goal}`,
        `Status: ${task.status}`,
        `Progress: ${task.current_step}/${task.total_steps}`,
        `Created: ${task.created_at}`,
      ];
      
      if (task.error) lines.push(`Error: ${task.error}`);
      if (task.completed_at) lines.push(`Completed: ${task.completed_at}`);
      
      return { content: [{ type: 'text', text: lines.join('\n') }] };
    }
  );

  // ── rtk_task_list ──
  server.tool(
    'rtk_task_list',
    'List tasks for a project',
    {
      project: z.string(),
      limit: z.number().min(1).max(50).default(10).optional(),
      activeOnly: z.boolean().default(false).optional(),
    },
    async ({ project, limit = 10, activeOnly = false }) => {
      const tasks = activeOnly 
        ? await Tasks.getActiveTasks(project)
        : await Tasks.getTasksByProject(project, limit);
      
      if (tasks.length === 0) {
        return { content: [{ type: 'text', text: `No tasks found for ${project}` }] };
      }
      
      const lines = [`📋 Tasks for ${project} (${tasks.length}):\n`];
      tasks.forEach(t => {
        lines.push(`  ${t.status === 'completed' ? '✅' : t.status === 'failed' ? '❌' : '⏳'} ${t.id.slice(0, 8)} - ${t.goal} [${t.status}]`);
      });
      
      return { content: [{ type: 'text', text: lines.join('\n') }] };
    }
  );

  // ── rtk_activity_logs ──
  server.tool(
    'rtk_activity_logs',
    'Get activity logs for a project',
    {
      project: z.string(),
      limit: z.number().min(1).max(100).default(50).optional(),
      action: z.string().optional().describe('Filter by action type'),
    },
    async ({ project, limit = 50, action }) => {
      const logs = await ActivityLogs.getActivityLogs(project, limit, action);
      
      if (logs.length === 0) {
        return { content: [{ type: 'text', text: `No activity logs for ${project}` }] };
      }
      
      const lines = [`📊 Activity Logs for ${project} (${logs.length}):\n`];
      logs.forEach(log => {
        const time = new Date(log.created_at).toLocaleString();
        lines.push(`  [${time}] ${log.action} - ${log.message}`);
        if (log.file_path) lines.push(`    📄 ${log.file_path}`);
      });
      
      return { content: [{ type: 'text', text: lines.join('\n') }] };
    }
  );

  // ── rtk_project_list ──
  server.tool(
    'rtk_project_list',
    'List all registered projects',
    {},
    async () => {
      const projects = await Projects.getAllProjects();
      
      if (projects.length === 0) {
        return { content: [{ type: 'text', text: 'No projects registered' }] };
      }
      
      const lines = [`📁 Registered Projects (${projects.length}):\n`];
      for (const p of projects) {
        const stats = await FileIndex.getIndexStats(p.name);
        const indexed = stats ? `${stats.total_files} files, ${stats.total_chunks} chunks` : 'not indexed';
        lines.push(`  ${p.name} - ${indexed}`);
        lines.push(`    Path: ${p.path}`);
        if (p.tech_stack) lines.push(`    Stack: ${p.tech_stack}`);
      }
      
      return { content: [{ type: 'text', text: lines.join('\n') }] };
    }
  );

  // ── rtk_project_register ──
  server.tool(
    'rtk_project_register',
    'Register a new project',
    {
      name: z.string(),
      path: z.string(),
      techStack: z.string().optional(),
    },
    async ({ name, path, techStack }) => {
      await Projects.createProject(name, path, techStack);
      return { content: [{ type: 'text', text: `✅ Project ${name} registered` }] };
    }
  );
}
