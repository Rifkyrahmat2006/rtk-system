# 🎨 RTK Web Dashboard

## 📌 Overview

RTK v5.0 sekarang dilengkapi dengan **Web Dashboard** untuk management dan monitoring sistem secara visual.

## 🚀 Access Dashboard

```
http://localhost:3000
```

## ✨ Features

### 1. 📊 Overview Tab
- **System Statistics**
  - Total projects
  - Total tasks
  - Active tasks
  - Activity logs count
  
- **Recent Activity**
  - Last 5 activities
  - Real-time updates

### 2. 📁 Projects Tab
- **View All Projects**
  - Project name & path
  - Tech stack
  - Index status
  - File & chunk statistics
  
- **Add New Project**
  - Register project via form
  - Set tech stack
  - Auto-refresh list

### 3. 📋 Tasks Tab
- **View All Tasks**
  - Task ID & goal
  - Status (pending, in-progress, completed, failed)
  - Progress tracking
  - Created date
  
- **Filters**
  - Filter by project
  - Filter by status

### 4. 📝 Activity Logs Tab
- **View Activity Logs**
  - All AI actions logged
  - Timestamp
  - Project & action type
  - File path (if applicable)
  
- **Filters**
  - Filter by project
  - Filter by action type
  - Limit results (10-200)

### 5. ⚙️ Config Tab
- **Server Settings**
  - Port configuration
  - API key management
  
- **Database Settings**
  - MySQL host & port
  - Database credentials
  - Database name
  
- **MCP Tools List**
  - View all 18 available tools
  - Tool descriptions

## 🎯 Usage Examples

### Add New Project

1. Go to **Projects** tab
2. Click **+ Add Project**
3. Fill in:
   - Project Name: `myproject`
   - Project Path: `D:\path\to\project`
   - Tech Stack: `Node.js, React` (optional)
4. Click **Add Project**

### Monitor Tasks

1. Go to **Tasks** tab
2. Select project from filter
3. View task status & progress
4. Filter by status if needed

### View Activity Logs

1. Go to **Activity Logs** tab
2. Select project (or view all)
3. Set limit (default: 50)
4. View real-time activity

### Update Configuration

1. Go to **Config** tab
2. Update settings:
   - Server port
   - Database credentials
3. Click **Save Configuration**
4. Restart server: `npm run pm2:restart`

## 🔧 API Endpoints

Dashboard menggunakan REST API:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects` | GET | Get all projects |
| `/api/projects` | POST | Add new project |
| `/api/tasks` | GET | Get tasks (with filters) |
| `/api/logs` | GET | Get activity logs |
| `/api/config` | GET | Get configuration |
| `/api/config` | POST | Save configuration |
| `/api/tools` | GET | Get available tools |

### Example API Usage

```bash
# Get all projects
curl http://localhost:3000/api/projects

# Add new project
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"myproject","path":"D:\\path","techStack":"Node.js"}'

# Get tasks for specific project
curl http://localhost:3000/api/tasks?project=smartani

# Get activity logs
curl http://localhost:3000/api/logs?project=smartani&limit=20
```

## 🎨 Screenshots

### Overview
- System statistics cards
- Recent activity feed

### Projects
- Grid layout with project cards
- Index status badges
- File & chunk counts

### Tasks
- List view with status badges
- Progress indicators
- Filter controls

### Logs
- Chronological activity list
- Color-coded actions
- File path display

### Config
- Form-based configuration
- Tools list display
- Save & reset buttons

## 🔐 Security

- Dashboard accessible on localhost only (default)
- API key protection (if enabled)
- No sensitive data exposed in frontend
- Password fields masked

## 📱 Responsive Design

- Desktop optimized
- Tablet compatible
- Mobile friendly (basic)

## 🎯 Keyboard Shortcuts

- `Tab` - Navigate between fields
- `Enter` - Submit forms
- `Esc` - Close modals

## 🔄 Auto-Refresh

- Server status: Every 30 seconds
- Manual refresh: Click tab again

## 🛠️ Customization

### Change Port

Edit `.env`:
```env
PORT=8080
```

Restart server:
```bash
npm run pm2:restart
```

### Custom Styling

Edit `public/css/dashboard.css` untuk customize tampilan.

### Add Custom Features

1. Add route in `server/api-routes.js`
2. Add UI in `public/index.html`
3. Add logic in `public/js/dashboard.js`

## 🐛 Troubleshooting

### Dashboard not loading

1. Check server is running: `pm2 status`
2. Check port: `http://localhost:3000`
3. Check browser console for errors

### API errors

1. Check database connection
2. Verify `.env` configuration
3. Check server logs: `pm2 logs rtk-mcp`

### Styling issues

1. Clear browser cache
2. Hard refresh: `Ctrl+F5`
3. Check CSS file loaded

## 📊 Performance

- Initial load: < 1 second
- API response: < 100ms
- Real-time updates: 30s interval
- Lightweight: ~50KB total assets

## 🎉 Benefits

### Before (v4.0)
- ❌ No visual interface
- ❌ CLI only
- ❌ Hard to monitor
- ❌ Manual config editing

### After (v5.0)
- ✅ Beautiful web dashboard
- ✅ Visual monitoring
- ✅ Easy project management
- ✅ GUI configuration
- ✅ Real-time activity feed

## 🚀 Next Steps

1. **Access dashboard**: `http://localhost:3000`
2. **Add projects** via UI
3. **Monitor tasks** in real-time
4. **View logs** for debugging
5. **Configure** via web interface

---

**Dashboard Version:** 1.0.0  
**RTK Version:** 5.0.0  
**Status:** ✅ Production Ready
