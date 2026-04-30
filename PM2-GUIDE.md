# 🚀 RTK PM2 Management Guide

## ✅ Status: Auto-Start Enabled

Server RTK akan **otomatis jalan** setiap kali laptop menyala.

## 📊 PM2 Commands

### Status & Monitoring
```bash
# Lihat status server
pm2 status

# Monitoring real-time (CPU, Memory)
pm2 monit

# Lihat logs real-time
pm2 logs rtk-mcp

# Lihat info detail
pm2 info rtk-mcp
```

### Control Server
```bash
# Start server
npm run pm2:start
# atau
pm2 start ecosystem.config.cjs

# Stop server
npm run pm2:stop
# atau
pm2 stop rtk-mcp

# Restart server
npm run pm2:restart
# atau
pm2 restart rtk-mcp

# Reload (zero-downtime)
pm2 reload rtk-mcp

# Delete dari PM2
pm2 delete rtk-mcp
```

### Logs
```bash
# Lihat logs (real-time)
pm2 logs rtk-mcp

# Lihat 50 baris terakhir
pm2 logs rtk-mcp --lines 50

# Clear logs
pm2 flush

# Lihat error logs saja
pm2 logs rtk-mcp --err
```

### Auto-Start Management
```bash
# Save current process list
pm2 save

# Uninstall auto-start
pm2-startup uninstall

# Re-install auto-start
pm2-startup install
pm2 save
```

## 🔧 Troubleshooting

### Server tidak jalan setelah restart laptop?
```bash
# Check PM2 status
pm2 status

# Jika kosong, restore dari saved list
pm2 resurrect

# Atau start manual
npm run pm2:start
pm2 save
```

### Port 3000 sudah dipakai?
```bash
# Check process di port 3000
netstat -ano | findstr :3000

# Kill process
taskkill /F /PID <PID>

# Restart PM2
pm2 restart rtk-mcp
```

### Server crash terus?
```bash
# Lihat error logs
pm2 logs rtk-mcp --err --lines 100

# Check info
pm2 info rtk-mcp

# Restart dengan logs
pm2 restart rtk-mcp --update-env
```

## 📈 Performance Monitoring

```bash
# Dashboard monitoring
pm2 monit

# Web-based monitoring (optional)
pm2 install pm2-server-monit
```

## 🎯 Quick Reference

| Command | Description |
|---------|-------------|
| `pm2 status` | Lihat status semua process |
| `pm2 logs` | Lihat logs real-time |
| `pm2 monit` | Dashboard monitoring |
| `pm2 restart rtk-mcp` | Restart server |
| `pm2 stop rtk-mcp` | Stop server |
| `pm2 save` | Save process list |

## 🔗 Useful Links

- PM2 Docs: https://pm2.keymetrics.io/docs/usage/quick-start/
- PM2 Windows Startup: https://www.npmjs.com/package/pm2-windows-startup

---

**Server URL:** http://localhost:3000/mcp  
**Health Check:** http://localhost:3000/health  
**Auto-Start:** ✅ Enabled
