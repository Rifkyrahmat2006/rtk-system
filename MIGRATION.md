# Migration Guide: RTK v4.0 → v5.0

## 📋 Overview

RTK v5.0 menambahkan MySQL integration tanpa breaking changes. Semua fitur v4.0 tetap berfungsi.

## ⚡ Quick Migration (5 menit)

```bash
# 1. Pull latest code
git pull

# 2. Install new dependencies
npm install

# 3. Setup database
copy .env.example .env
# Edit .env dengan MySQL credentials

# 4. Initialize database
npm run db:init

# 5. Test
npm run db:test

# 6. Restart server
npm start
```

## 🔄 Step-by-Step Migration

### Step 1: Backup (Optional)

```bash
# Backup existing vector database
xcopy /E /I rag\vector-db rag\vector-db.backup
```

### Step 2: Update Dependencies

```bash
npm install
```

New dependency: `mysql2@^3.11.5`

### Step 3: Setup MySQL

#### Option A: Local MySQL

```bash
# Install MySQL 8.0+
# Create database
mysql -u root -p
CREATE DATABASE rtk_system CHARACTER SET utf8mb4;
```

#### Option B: Docker MySQL

```bash
docker run -d \
  --name rtk-mysql \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=rtk_system \
  -p 3306:3306 \
  mysql:8.0
```

### Step 4: Configure Environment

```bash
copy .env.example .env
```

Edit `.env`:

```env
# Existing config (keep as is)
RTK_API_KEY=your-secret-key-here
PORT=3000

# New MySQL config (add these)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=rtk_system
```

### Step 5: Initialize Database

```bash
npm run db:init
```

Expected output:
```
✅ Database initialized successfully
```

### Step 6: Migrate Projects

#### From config/projects.json

Old way (v4.0):
```json
{
  "projects": {
    "smartani": "D:\\path\\to\\smartani"
  }
}
```

New way (v5.0) - Register via MCP:
```
@rtk_project_register name: smartani, path: D:\path\to\smartani, techStack: "Node.js, Vue"
```

Or via SQL:
```sql
INSERT INTO projects (name, path, tech_stack) 
VALUES ('smartani', 'D:\\path\\to\\smartani', 'Node.js, Vue');
```

**Note:** `config/projects.json` masih digunakan sebagai fallback jika DB tidak tersedia.

### Step 7: Test Migration

```bash
npm run db:test
```

Expected: `12/12 tests passing`

### Step 8: Restart Server

```bash
# Stop old server
Ctrl+C

# Start new server
npm start
```

Or with PM2:
```bash
npm run pm2:restart
```

## ✅ Verification Checklist

- [ ] Dependencies installed (`mysql2` present)
- [ ] `.env` configured with DB credentials
- [ ] Database initialized (tables created)
- [ ] Tests passing (12/12)
- [ ] Server starts without errors
- [ ] Old tools still work (`rtk_ask`, `rtk_explore`, etc.)
- [ ] New tools available (`rtk_project_list`, `rtk_task_list`, etc.)

## 🆕 New Features Available

After migration, you can use:

### 1. Project Management
```
@rtk_project_list
@rtk_project_register name: newproject, path: C:\path
```

### 2. Task Tracking
```
@rtk_task_list project: smartani
@rtk_task_status taskId: "abc-123"
```

### 3. Activity Monitoring
```
@rtk_activity_logs project: smartani, limit: 50
```

## 🔧 Troubleshooting

### Issue: Database connection failed

**Solution:**
1. Check MySQL is running: `mysql -u root -p`
2. Verify credentials in `.env`
3. Ensure database exists: `SHOW DATABASES;`

### Issue: Tables not created

**Solution:**
```bash
# Run schema manually
mysql -u root -p rtk_system < db\schema.sql
```

### Issue: Server won't start

**Solution:**
Server will start even if DB fails (degraded mode). Check logs:
```bash
npm start
# Look for: "⚠️ Database initialization failed"
```

### Issue: Old tools not working

**Solution:**
This shouldn't happen. If it does:
1. Check `config/projects.json` still exists
2. Verify vector database in `rag/vector-db/`
3. Re-index project: `npm run index <project>`

## 🔙 Rollback (If Needed)

```bash
# 1. Stop server
Ctrl+C

# 2. Checkout v4.0
git checkout v4.0

# 3. Restore dependencies
npm install

# 4. Restore vector DB (if backed up)
rmdir /S /Q rag\vector-db
xcopy /E /I rag\vector-db.backup rag\vector-db

# 5. Start server
npm start
```

## 📊 What Changed

### Added Files
```
db/
  ├── schema.sql
  ├── connection.js
  ├── init.js
  ├── projects.js
  ├── tasks.js
  ├── activity-logs.js
  ├── file-index.js
  └── index.js
server/
  └── monitoring-tools.js
test-db.js
setup-v5.bat
SETUP-V5.md
README-V5.md
MIGRATION.md (this file)
```

### Modified Files
```
package.json          → v5.0.0, mysql2 dependency
server/mcp-http.js    → integrate monitoring tools
.env.example          → add DB config
```

### No Changes
```
rag/                  → unchanged
agents/               → unchanged
tools/                → unchanged
indexer/              → unchanged
config/projects.json  → still used as fallback
```

## 🎯 Next Steps

After successful migration:

1. **Register all projects** to database
2. **Monitor activity** with new tools
3. **Prepare for Phase 3** (autonomous agent)

## 📚 Documentation

- [Setup Guide](SETUP-V5.md)
- [v5.0 README](README-V5.md)
- [PRD](plan4.md)

## 🆘 Need Help?

If migration fails:
1. Check troubleshooting section above
2. Review server logs
3. Test database connection manually
4. Rollback to v4.0 if needed

---

**Migration Time:** ~5-10 minutes  
**Downtime:** ~1 minute (server restart)  
**Risk Level:** Low (backward compatible)
