# RTK v5.0 Setup Guide

## 🎯 What's New in v5.0

RTK v5.0 adds **MySQL Integration Layer** for:
- ✅ Task memory (agent state)
- ✅ Activity logging (audit trail)
- ✅ Project metadata management
- ✅ File index tracking
- ✅ Monitoring tools

---

## 📋 Prerequisites

1. **Node.js** (v18+)
2. **MySQL** (v8.0+)
3. **npm** or **yarn**

---

## 🚀 Installation

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `mysql2` - MySQL client
- Other existing dependencies

### 2. Setup MySQL Database

Create database:

```sql
CREATE DATABASE rtk_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or use existing database.

### 3. Configure Environment

Copy `.env.example` to `.env`:

```bash
copy .env.example .env
```

Edit `.env`:

```env
RTK_API_KEY=your-secret-key-here
PORT=3000

# MySQL Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=rtk_system
```

### 4. Initialize Database Schema

```bash
npm run db:init
```

This creates all required tables:
- `projects`
- `tasks`
- `activity_logs`
- `file_index`
- `index_stats`

### 5. Register Your Project

Option A - Via MCP Tool:
```
@rtk_project_register name: myproject, path: C:\path\to\project, techStack: "Node.js, React"
```

Option B - Direct SQL:
```sql
INSERT INTO projects (name, path, tech_stack) 
VALUES ('myproject', 'C:\\path\\to\\project', 'Node.js, React');
```

### 6. Start Server

```bash
npm start
```

Or with PM2:
```bash
npm run pm2:start
```

---

## 🛠️ New MCP Tools

### Monitoring Tools

| Tool | Description | Example |
|------|-------------|---------|
| `rtk_task_status` | Get task status | `@rtk_task_status taskId: "abc-123"` |
| `rtk_task_list` | List tasks | `@rtk_task_list project: myproject, limit: 10` |
| `rtk_activity_logs` | View activity logs | `@rtk_activity_logs project: myproject, limit: 50` |
| `rtk_project_list` | List all projects | `@rtk_project_list` |
| `rtk_project_register` | Register project | `@rtk_project_register name: myproject, path: C:\path` |

### Usage Examples

**Check task status:**
```
@rtk_task_status taskId: "550e8400-e29b-41d4-a716-446655440000"
```

**List active tasks:**
```
@rtk_task_list project: smartani, activeOnly: true
```

**View recent activity:**
```
@rtk_activity_logs project: smartani, limit: 20
```

**List all projects:**
```
@rtk_project_list
```

---

## 📊 Database Schema

### projects
- Stores project metadata
- Tracks last indexed time

### tasks
- Agent state management
- Resume capability
- Progress tracking

### activity_logs
- Audit trail
- All AI actions logged
- Filterable by project/action

### file_index
- Incremental indexing
- File change detection
- Hash-based tracking

### index_stats
- Indexing statistics
- Performance metrics

---

## 🔧 Troubleshooting

### Database Connection Failed

Check:
1. MySQL is running
2. Credentials in `.env` are correct
3. Database exists
4. User has permissions

### Tables Not Created

Run manually:
```bash
mysql -u root -p rtk_system < db/schema.sql
```

### Server Runs Without DB

Server will start even if DB fails, but monitoring tools won't work.

---

## 🎯 Migration from v4.0

1. Install new dependencies: `npm install`
2. Setup MySQL (see above)
3. Run `npm run db:init`
4. Register existing projects via `rtk_project_register`
5. Re-index projects: `npm run index <project>`

No breaking changes to existing tools!

---

## 📈 What's Next (Phase 3)

With v5.0 foundation:
- ✅ Task memory → Multi-step agent
- ✅ Activity logs → Debugging & rollback
- ✅ File tracking → Incremental indexing
- ✅ Monitoring → Observability

Ready for autonomous agent implementation!

---

## 🆘 Support

Issues? Check:
1. `.env` configuration
2. MySQL connection
3. Database initialization
4. Server logs

---

**Version:** 5.0.0  
**Status:** ✅ MySQL Integration Complete  
**Ready for:** Phase 3 (Autonomous Agent)
