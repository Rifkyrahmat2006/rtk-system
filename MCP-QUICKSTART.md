# 🔌 Quick MCP Setup untuk Amazon Q

## ⚡ Setup Cepat (3 Langkah)

### 1. Buka MCP Config

**Windows:**
```
%USERPROFILE%\.aws\amazonq\mcp.json
```

**Mac/Linux:**
```
~/.aws/amazonq/mcp.json
```

### 2. Tambahkan Konfigurasi

Copy-paste ini ke `mcp.json`:

```json
{
  "mcpServers": {
    "rtk-system": {
      "command": "node",
      "args": ["C:\\rtk-system\\server\\mcp-stdio.js"]
    }
  }
}
```

**⚠️ PENTING:** Ganti path sesuai lokasi RTK Anda!

### 3. Reload VS Code

- Tekan `Ctrl+Shift+P`
- Ketik "Developer: Reload Window"
- Enter

## ✅ Test Koneksi

Di Amazon Q chat, ketik:

```
@rtk_project_list
```

Jika berhasil, akan muncul list projects!

## 🎯 Tools yang Tersedia

Setelah terkoneksi, gunakan tools ini:

```
@rtk_project_list
@rtk_ask project: smartani, prompt: "explain auth"
@rtk_semantic_search project: smartani, query: "login"
@rtk_explore project: smartani, depth: 2
@rtk_task_list project: smartani
@rtk_activity_logs project: smartani
```

## 🐛 Troubleshooting

### Error: Command not found

Gunakan full path ke node:

```json
{
  "mcpServers": {
    "rtk-system": {
      "command": "C:\\Program Files\\nodejs\\node.exe",
      "args": ["C:\\rtk-system\\server\\mcp-stdio.js"]
    }
  }
}
```

### Error: Module not found

Pastikan dependencies installed:

```bash
cd C:\rtk-system
npm install
```

### Error: Database connection

Check database running:

```bash
npm run db:test
```

### Tools tidak muncul

1. Check config path benar
2. Reload VS Code
3. Check Amazon Q logs

## 📝 Contoh Lengkap

```json
{
  "mcpServers": {
    "rtk-system": {
      "command": "node",
      "args": ["C:\\rtk-system\\server\\mcp-stdio.js"],
      "env": {
        "NODE_ENV": "production"
      },
      "disabled": false
    }
  }
}
```

## 🎉 Selesai!

Sekarang Anda bisa:
- Query code dengan AI
- Search semantic
- Monitor tasks & logs
- Explore project structure

Semua dari Amazon Q chat! 🚀

---

**Dashboard tetap bisa diakses di:** http://localhost:3000
