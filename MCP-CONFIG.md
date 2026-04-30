# Konfigurasi MCP untuk Amazon Q

## 📋 Cara Setup MCP di Amazon Q

### 1. Buka Amazon Q Settings

Di VS Code:
- Tekan `Ctrl+Shift+P`
- Ketik "Amazon Q: Open Settings"
- Atau buka file: `%USERPROFILE%\.aws\amazonq\mcp.json` (Windows)

### 2. Tambahkan Konfigurasi RTK

Tambahkan konfigurasi ini ke `mcp.json`:

```json
{
  "mcpServers": {
    "rtk-system": {
      "command": "node",
      "args": ["C:\\rtk-system\\server\\mcp-http.js"],
      "env": {
        "PORT": "3000"
      }
    }
  }
}
```

### 3. Restart Amazon Q

- Reload VS Code window: `Ctrl+Shift+P` → "Developer: Reload Window"
- Atau restart VS Code

### 4. Test Koneksi

Di Amazon Q chat, coba:
```
@rtk_project_list
```

## 🔧 Alternatif: HTTP Transport

Jika masih error, gunakan HTTP transport:

```json
{
  "mcpServers": {
    "rtk-system": {
      "url": "http://localhost:3000/mcp",
      "transport": "http"
    }
  }
}
```

## 🚀 Cara Pakai

Setelah terkoneksi, gunakan tools dengan prefix `@`:

```
@rtk_ask project: smartani, prompt: "explain authentication"
@rtk_semantic_search project: smartani, query: "login"
@rtk_explore project: smartani, depth: 2
@rtk_project_list
```

## 🐛 Troubleshooting

### Error: OAuth failed

**Solusi:** Gunakan stdio transport (command + args) bukan HTTP

### Error: Command not found

**Solusi:** Gunakan full path ke node.exe:
```json
"command": "C:\\Program Files\\nodejs\\node.exe"
```

### Error: Module not found

**Solusi:** Pastikan server running:
```bash
pm2 status
```

### Error: Connection refused

**Solusi:** 
1. Check server: `curl http://localhost:3000/health`
2. Restart server: `pm2 restart rtk-mcp`

## 📝 Konfigurasi Lengkap (Recommended)

```json
{
  "mcpServers": {
    "rtk-system": {
      "command": "node",
      "args": [
        "C:\\rtk-system\\server\\mcp-http.js"
      ],
      "env": {
        "PORT": "3000",
        "NODE_ENV": "production"
      },
      "disabled": false
    }
  }
}
```

## ✅ Verifikasi

Setelah setup, cek di Amazon Q:
1. Ketik `@` di chat
2. Lihat apakah `rtk_` tools muncul
3. Test dengan `@rtk_project_list`

---

**Note:** Pastikan server RTK sudah running sebelum connect MCP!

```bash
pm2 status
# Jika belum running:
pm2 start ecosystem.config.cjs
```
