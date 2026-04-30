# 🤖 RTK AI Coding System v5.0

> **AI-powered code intelligence with RAG, MySQL, and Web Dashboard**

[![Version](https://img.shields.io/badge/version-5.0.0-blue.svg)](package.json)
[![Dashboard](https://img.shields.io/badge/dashboard-enabled-green.svg)](http://localhost:3000)
[![MCP](https://img.shields.io/badge/MCP-integrated-purple.svg)](server/mcp-http.js)

## 🎯 What's New in v5.0

### ✨ Major Features
- 🎨 **Web Dashboard** - Visual management & monitoring
- 🗄️ **MySQL Integration** - Stateful task memory & audit trail
- 📊 **Real-time Monitoring** - Track all AI activities
- ⚙️ **GUI Configuration** - No more manual .env editing
- 📋 **Task Management** - Resume & track multi-step tasks

## 🚀 Quick Start

### 1. Install & Setup

```bash
# Install dependencies
npm install

# Setup database & config
npm run setup
```

### 2. Access Dashboard

```
http://localhost:3000
```

### 3. Add Your Project

**Via Dashboard:**
1. Go to Projects tab
2. Click "+ Add Project"
3. Fill in details

**Via CLI:**
```bash
node register-smartani.js
```

### 4. Index Project

```bash
npm run index smartani
```

### 5. Start Using!

**Via Dashboard:**
- Monitor tasks & logs
- Manage projects
- View statistics

**Via Amazon Q:**
```
@rtk_ask project: smartani, prompt: "explain authentication"
@rtk_semantic_search project: smartani, query: "login flow"
```

## 📊 Dashboard Features

### Overview Tab
- System statistics
- Recent activity feed
- Real-time status

### Projects Tab
- View all projects
- Add new projects
- Index status & stats

### Tasks Tab
- View all tasks
- Filter by project/status
- Track progress

### Logs Tab
- Activity audit trail
- Filter by project/action
- Real-time updates

### Config Tab
- Server settings
- Database config
- MCP tools list

## 🛠️ Available Tools (18 Total)

### Read Tools
- `rtk_ask` - Natural language queries
- `rtk_semantic_search` - Semantic search
- `rtk_explore` - Browse structure
- `rtk_search` - Keyword search
- `rtk_read` - Read files
- `rtk_index_stats` - Check index

### Write Tools
- `rtk_write` - Write/overwrite files
- `rtk_patch` - Apply patches
- `rtk_rollback` - Rollback changes

### Git Tools
- `rtk_git_status` - Git status
- `rtk_git_diff` - Show diff
- `rtk_git_commit` - Commit changes
- `rtk_git_log` - View commits

### Monitoring Tools
- `rtk_project_list` - List projects
- `rtk_project_register` - Register project
- `rtk_task_status` - Task status
- `rtk_task_list` - List tasks
- `rtk_activity_logs` - Activity logs

## 📁 Project Structure

```
rtk-system/
├── public/              # Web dashboard
│   ├── index.html
│   ├── css/
│   └── js/
├── server/              # MCP & API server
│   ├── mcp-http.js
│   ├── api-routes.js
│   └── monitoring-tools.js
├── db/                  # MySQL layer
│   ├── schema.sql
│   ├── connection.js
│   └── *.js (models)
├── rag/                 # RAG engine
├── agents/              # Agent system
├── tools/               # Code tools
└── indexer/             # Indexing
```

## 🎯 Use Cases

### 1. Code Understanding
```
@rtk_ask project: smartani, prompt: "how does authentication work?"
```

### 2. Find Code
```
@rtk_semantic_search project: smartani, query: "user registration"
```

### 3. Modify Code
```
@rtk_write project: smartani, file: "config.js", content: "..."
```

### 4. Git Operations
```
@rtk_git_commit project: smartani, message: "fix: update config"
```

### 5. Monitor Activity
- Open dashboard: `http://localhost:3000`
- Go to Logs tab
- View all AI actions

## 📊 Statistics (Project Smartani)

- **Files Indexed:** 1,753
- **Code Chunks:** 7,612
- **Vector Docs:** 22,833
- **Database:** rtk_system
- **Status:** ✅ Ready

## 🔧 Configuration

### Via Dashboard
1. Go to `http://localhost:3000`
2. Click Config tab
3. Update settings
4. Save & restart

### Via .env File
```env
PORT=3000
RTK_API_KEY=your-secret-key

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=rtk_system
```

## 🧪 Testing

```bash
# Test database
npm run db:test

# Verify setup
node verify-setup.js

# Test MCP
node test-mcp.js
```

## 📚 Documentation

- [Dashboard Guide](DASHBOARD.md) - Web dashboard usage
- [Setup Guide](SETUP-V5.md) - Detailed setup
- [Migration Guide](MIGRATION.md) - Upgrade from v4
- [Implementation](IMPLEMENTATION-V5.md) - Technical details
- [Smartani Setup](SETUP-SMARTANI.md) - Project-specific

## 🛣️ Roadmap

- [x] Phase 1: RAG Setup ✅
- [x] Phase 2: Code Modification ✅
- [x] Phase 2.5: MySQL Integration ✅
- [x] Phase 2.6: Web Dashboard ✅
- [ ] Phase 3: Autonomous Agent (Next)

## 🎉 Success Metrics

- ✅ 1,753 files indexed
- ✅ 18 MCP tools available
- ✅ Web dashboard operational
- ✅ MySQL integration complete
- ✅ Task memory system ready
- ✅ Activity logging active

## 🆘 Troubleshooting

### Dashboard not loading
```bash
# Check server
pm2 status

# Restart
npm run pm2:restart
```

### Database errors
```bash
# Reinitialize
npm run db:init

# Test connection
npm run db:test
```

### Index issues
```bash
# Re-index
npm run index smartani
```

## 🤝 Contributing

This is a personal project for Smart Tani development.

## 📄 License

MIT

---

## 🚀 Get Started Now!

```bash
# 1. Start server
npm start

# 2. Open dashboard
http://localhost:3000

# 3. Start coding with AI!
```

**Version:** 5.0.0  
**Status:** ✅ Production Ready  
**Dashboard:** ✅ Enabled  
**Project:** smartani ✅ Indexed
