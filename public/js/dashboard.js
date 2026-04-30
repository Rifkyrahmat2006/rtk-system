const API_BASE = '/api';

// Tab Navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        
        // Update nav
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update content
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(tab).classList.add('active');
        
        // Load data for tab
        loadTabData(tab);
    });
});

// Load tab data
function loadTabData(tab) {
    switch(tab) {
        case 'overview':
            loadOverview();
            break;
        case 'projects':
            loadProjects();
            break;
        case 'tasks':
            loadTasks();
            break;
        case 'logs':
            loadLogs();
            break;
        case 'config':
            loadConfig();
            break;
    }
}

// Check server status
async function checkServerStatus() {
    try {
        const res = await fetch('/health');
        const data = await res.json();
        
        const statusEl = document.getElementById('serverStatus');
        statusEl.classList.add('online');
        statusEl.innerHTML = '<span class="status-dot"></span><span>Online - v' + data.version + '</span>';
    } catch (error) {
        const statusEl = document.getElementById('serverStatus');
        statusEl.classList.add('offline');
        statusEl.innerHTML = '<span class="status-dot"></span><span>Offline</span>';
    }
}

// Load Overview
async function loadOverview() {
    try {
        const [projects, tasks, logs] = await Promise.all([
            fetch(`${API_BASE}/projects`).then(r => r.json()).catch(() => []),
            fetch(`${API_BASE}/tasks`).then(r => r.json()).catch(() => []),
            fetch(`${API_BASE}/logs?limit=10`).then(r => r.json()).catch(() => [])
        ]);
        
        document.getElementById('totalProjects').textContent = Array.isArray(projects) ? projects.length : 0;
        document.getElementById('totalTasks').textContent = Array.isArray(tasks) ? tasks.length : 0;
        document.getElementById('activeTasks').textContent = Array.isArray(tasks) ? tasks.filter(t => t.status === 'in-progress' || t.status === 'pending').length : 0;
        document.getElementById('totalLogs').textContent = Array.isArray(logs) ? logs.length : 0;
        
        // Recent activity
        const activityHtml = Array.isArray(logs) ? logs.slice(0, 5).map(log => `
            <div class="activity-item">
                <div class="log-time">${new Date(log.created_at).toLocaleString()}</div>
                <div><span class="log-action">${log.action}</span> - ${log.message}</div>
                ${log.file_path ? `<div class="log-file">📄 ${log.file_path}</div>` : ''}
            </div>
        `).join('') : '';
        
        document.getElementById('recentActivity').innerHTML = activityHtml || '<div class="loading">No recent activity</div>';
    } catch (error) {
        console.error('Failed to load overview:', error);
        document.getElementById('recentActivity').innerHTML = '<div class="loading">Failed to load data</div>';
    }
}

// Load Projects
async function loadProjects() {
    try {
        const projects = await fetch(`${API_BASE}/projects`).then(r => r.json()).catch(() => []);
        
        if (!Array.isArray(projects)) {
            document.getElementById('projectsList').innerHTML = '<div class="loading">Failed to load projects</div>';
            return;
        }
        
        const projectsHtml = projects.map(p => `
            <div class="project-card">
                <div class="project-header">
                    <div class="project-name">📁 ${p.name}</div>
                    <span class="project-badge ${p.last_indexed ? 'badge-indexed' : 'badge-not-indexed'}">
                        ${p.last_indexed ? 'Indexed' : 'Not Indexed'}
                    </span>
                </div>
                <div class="project-info">📂 ${p.path}</div>
                ${p.tech_stack ? `<div class="project-info">🛠️ ${p.tech_stack}</div>` : ''}
                <div class="project-stats">
                    <div class="project-stat">
                        <strong>${p.total_files || 0}</strong>
                        Files
                    </div>
                    <div class="project-stat">
                        <strong>${p.total_chunks || 0}</strong>
                        Chunks
                    </div>
                </div>
                <div class="project-actions">
                    ${!p.last_indexed ? 
                        `<button class="btn-small btn-index" onclick="indexProject('${p.name}')">🔍 Index Now</button>` :
                        `<button class="btn-small btn-reindex" onclick="indexProject('${p.name}')">🔄 Re-index</button>`
                    }
                    <button class="btn-small btn-delete" onclick="deleteProject('${p.name}')">🗑️ Delete</button>
                </div>
            </div>
        `).join('');
        
        document.getElementById('projectsList').innerHTML = projectsHtml || '<div class="loading">No projects found</div>';
        
        // Update filters
        updateProjectFilters(projects);
    } catch (error) {
        console.error('Failed to load projects:', error);
        document.getElementById('projectsList').innerHTML = '<div class="loading">Failed to load projects</div>';
    }
}

// Load Tasks
async function loadTasks() {
    try {
        const project = document.getElementById('taskProjectFilter').value;
        const status = document.getElementById('taskStatusFilter').value;
        
        let url = `${API_BASE}/tasks?`;
        if (project) url += `project=${project}&`;
        if (status) url += `status=${status}&`;
        
        const tasks = await fetch(url).then(r => r.json());
        
        const tasksHtml = tasks.map(t => {
            const statusClass = `status-${t.status}`;
            const progress = t.total_steps > 0 ? `${t.current_step}/${t.total_steps}` : '-';
            
            return `
                <div class="task-card">
                    <div class="task-info">
                        <div class="task-id">${t.id}</div>
                        <div class="task-goal">${t.goal}</div>
                        <div class="task-meta">
                            📁 ${t.project} | 📊 Progress: ${progress} | 📅 ${new Date(t.created_at).toLocaleString()}
                        </div>
                    </div>
                    <div class="task-status ${statusClass}">${t.status}</div>
                </div>
            `;
        }).join('');
        
        document.getElementById('tasksList').innerHTML = tasksHtml || '<div class="loading">No tasks found</div>';
    } catch (error) {
        console.error('Failed to load tasks:', error);
        document.getElementById('tasksList').innerHTML = '<div class="loading">Failed to load tasks</div>';
    }
}

// Load Logs
async function loadLogs() {
    try {
        const project = document.getElementById('logProjectFilter').value;
        const action = document.getElementById('logActionFilter').value;
        const limit = document.getElementById('logLimit').value;
        
        let url = `${API_BASE}/logs?limit=${limit}`;
        if (project) url += `&project=${project}`;
        if (action) url += `&action=${action}`;
        
        const logs = await fetch(url).then(r => r.json());
        
        const logsHtml = logs.map(log => `
            <div class="log-entry">
                <div class="log-time">${new Date(log.created_at).toLocaleString()}</div>
                <div>
                    📁 <strong>${log.project}</strong> | 
                    <span class="log-action">${log.action}</span> - 
                    <span class="log-message">${log.message}</span>
                </div>
                ${log.file_path ? `<div class="log-file">📄 ${log.file_path}</div>` : ''}
            </div>
        `).join('');
        
        document.getElementById('logsList').innerHTML = logsHtml || '<div class="loading">No logs found</div>';
    } catch (error) {
        console.error('Failed to load logs:', error);
        document.getElementById('logsList').innerHTML = '<div class="loading">Failed to load logs</div>';
    }
}

// Load Config
async function loadConfig() {
    try {
        const config = await fetch(`${API_BASE}/config`).then(r => r.json());
        
        document.getElementById('configPort').value = config.port || 3000;
        document.getElementById('configDbHost').value = config.db.host || 'localhost';
        document.getElementById('configDbPort').value = config.db.port || 3306;
        document.getElementById('configDbUser').value = config.db.user || 'root';
        document.getElementById('configDbName').value = config.db.database || 'rtk_system';
        
        // Load tools
        const tools = await fetch(`${API_BASE}/tools`).then(r => r.json());
        const toolsHtml = tools.map(tool => `
            <div class="tool-card">
                <div class="tool-name">${tool.name}</div>
                <div class="tool-desc">${tool.description}</div>
            </div>
        `).join('');
        
        document.getElementById('toolsList').innerHTML = toolsHtml;
    } catch (error) {
        console.error('Failed to load config:', error);
    }
}

// Save Config
async function saveConfig() {
    const config = {
        port: document.getElementById('configPort').value,
        apiKey: document.getElementById('configApiKey').value,
        db: {
            host: document.getElementById('configDbHost').value,
            port: document.getElementById('configDbPort').value,
            user: document.getElementById('configDbUser').value,
            password: document.getElementById('configDbPassword').value,
            database: document.getElementById('configDbName').value
        }
    };
    
    try {
        await fetch(`${API_BASE}/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });
        
        alert('Configuration saved! Please restart server.');
    } catch (error) {
        alert('Failed to save configuration: ' + error.message);
    }
}

// Add Project
function showAddProject() {
    document.getElementById('addProjectModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

async function addProject() {
    const name = document.getElementById('projectName').value;
    const path = document.getElementById('projectPath').value;
    const techStack = document.getElementById('projectTechStack').value;
    
    if (!name || !path) {
        alert('Please fill in project name and path');
        return;
    }
    
    try {
        await fetch(`${API_BASE}/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, path, techStack })
        });
        
        closeModal('addProjectModal');
        loadProjects();
        
        // Clear form
        document.getElementById('projectName').value = '';
        document.getElementById('projectPath').value = '';
        document.getElementById('projectTechStack').value = '';
    } catch (error) {
        alert('Failed to add project: ' + error.message);
    }
}

// Update project filters
function updateProjectFilters(projects) {
    const taskFilter = document.getElementById('taskProjectFilter');
    const logFilter = document.getElementById('logProjectFilter');
    
    const options = projects.map(p => `<option value="${p.name}">${p.name}</option>`).join('');
    
    taskFilter.innerHTML = '<option value="">All Projects</option>' + options;
    logFilter.innerHTML = '<option value="">All Projects</option>' + options;
}

// Index Project
async function indexProject(projectName) {
    document.getElementById('indexingProjectName').textContent = projectName;
    document.getElementById('indexProjectModal').classList.add('active');
    document.getElementById('indexCloseBtn').disabled = true;
    
    const progressBar = document.getElementById('indexProgress');
    const statusEl = document.getElementById('indexStatus');
    const logEl = document.getElementById('indexLog');
    
    progressBar.style.width = '0%';
    statusEl.textContent = 'Starting indexing...';
    logEl.innerHTML = '';
    
    try {
        const response = await fetch(`${API_BASE}/projects/${projectName}/index`, {
            method: 'POST'
        });
        
        if (!response.ok) throw new Error('Indexing failed');
        
        // Simulate progress (real implementation would use SSE or WebSocket)
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            if (progress <= 90) {
                progressBar.style.width = progress + '%';
                progressBar.textContent = progress + '%';
                statusEl.textContent = `Indexing files... ${progress}%`;
                logEl.innerHTML += `<div class="index-log-entry">Processing files...</div>`;
                logEl.scrollTop = logEl.scrollHeight;
            }
        }, 500);
        
        const result = await response.json();
        
        clearInterval(interval);
        progressBar.style.width = '100%';
        progressBar.textContent = '100%';
        statusEl.textContent = '✅ Indexing completed!';
        logEl.innerHTML += `<div class="index-log-entry">✅ Indexed ${result.files} files, ${result.chunks} chunks</div>`;
        
        document.getElementById('indexCloseBtn').disabled = false;
        
        // Reload projects
        setTimeout(() => {
            closeModal('indexProjectModal');
            loadProjects();
        }, 2000);
        
    } catch (error) {
        statusEl.textContent = '❌ Indexing failed';
        logEl.innerHTML += `<div class="index-log-entry">❌ Error: ${error.message}</div>`;
        document.getElementById('indexCloseBtn').disabled = false;
    }
}

// Delete Project
async function deleteProject(projectName) {
    if (!confirm(`Are you sure you want to delete project "${projectName}"?`)) {
        return;
    }
    
    try {
        await fetch(`${API_BASE}/projects/${projectName}`, {
            method: 'DELETE'
        });
        
        loadProjects();
    } catch (error) {
        alert('Failed to delete project: ' + error.message);
    }
}

// Initialize
checkServerStatus();
loadOverview();
setInterval(checkServerStatus, 30000); // Check every 30s
