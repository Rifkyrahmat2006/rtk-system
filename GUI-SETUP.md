# 🎨 Setup RTK Per Project via GUI

## ✨ Fitur Baru

Dashboard RTK sekarang mendukung **setup dan indexing project langsung dari GUI**!

## 🚀 Cara Menggunakan

### 1. **Tambah Project Baru**

1. Buka dashboard: http://localhost:3000
2. Klik tab **Projects**
3. Klik tombol **+ Add Project**
4. Isi form:
   - **Project Name:** nama project (e.g., `myproject`)
   - **Project Path:** path lengkap (e.g., `D:\path\to\project`)
   - **Tech Stack:** teknologi yang digunakan (optional)
5. Klik **Add Project**

### 2. **Index Project**

Setelah project ditambahkan, ada 2 cara index:

#### **Cara A: Via Dashboard (GUI)**

1. Di tab **Projects**, cari project yang belum di-index
2. Klik tombol **🔍 Index Now**
3. Modal akan muncul dengan progress bar
4. Tunggu hingga selesai (progress 100%)
5. Project otomatis ter-refresh dengan status "Indexed"

#### **Cara B: Via CLI**

```bash
npm run index <project-name>
```

### 3. **Re-index Project**

Jika ada perubahan code dan ingin update index:

1. Di tab **Projects**, cari project yang sudah di-index
2. Klik tombol **🔄 Re-index**
3. Tunggu proses selesai

### 4. **Delete Project**

Untuk menghapus project dari RTK:

1. Di tab **Projects**, cari project yang ingin dihapus
2. Klik tombol **🗑️ Delete**
3. Konfirmasi penghapusan
4. Project akan dihapus dari database

**Note:** File project tidak akan terhapus, hanya registrasi di RTK.

## 📊 Monitoring Progress

Saat indexing via GUI, Anda akan melihat:

- **Progress Bar:** Visual progress 0-100%
- **Status:** Status saat ini (e.g., "Indexing files... 45%")
- **Log:** Detail proses indexing

## 🎯 Contoh Workflow

### Setup Project Baru

```
1. Add Project
   ├─ Name: myproject
   ├─ Path: D:\code\myproject
   └─ Tech: Node.js, React

2. Index Project
   ├─ Click "Index Now"
   ├─ Wait for completion
   └─ Status: Indexed ✅

3. Use with Amazon Q
   └─ @rtk_ask project: myproject, prompt: "explain code"
```

### Update Existing Project

```
1. Make code changes
2. Go to Dashboard → Projects
3. Click "Re-index" on project
4. Wait for completion
5. Updated index ready!
```

## 🔧 API Endpoints

Dashboard menggunakan API endpoints ini:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects` | POST | Add new project |
| `/api/projects/:name` | DELETE | Delete project |
| `/api/projects/:name/index` | POST | Index/re-index project |

### Example API Usage

```bash
# Add project
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"myproject","path":"D:\\code\\myproject","techStack":"Node.js"}'

# Index project
curl -X POST http://localhost:3000/api/projects/myproject/index

# Delete project
curl -X DELETE http://localhost:3000/api/projects/myproject
```

## ⚡ Performance

- **Small project** (< 100 files): ~5-10 seconds
- **Medium project** (100-1000 files): ~30-60 seconds
- **Large project** (1000+ files): ~1-3 minutes

**Smartani example:**
- Files: 1,753
- Time: ~30 seconds
- Chunks: 7,612

## 🎨 UI Features

### Project Card

Setiap project card menampilkan:
- 📁 Project name
- 📂 Project path
- 🛠️ Tech stack
- 📊 Statistics (files & chunks)
- 🏷️ Status badge (Indexed/Not Indexed)
- 🔘 Action buttons (Index/Re-index/Delete)

### Index Modal

Modal indexing menampilkan:
- Project name yang sedang di-index
- Progress bar dengan persentase
- Status text real-time
- Log detail proses
- Close button (disabled saat indexing)

## 🐛 Troubleshooting

### Indexing stuck

1. Check server logs: `pm2 logs rtk-mcp`
2. Check project path valid
3. Restart server: `pm2 restart rtk-mcp`

### Progress tidak update

1. Hard refresh browser: `Ctrl+F5`
2. Check browser console for errors
3. Try CLI indexing: `npm run index <project>`

### Delete failed

1. Check project tidak sedang di-index
2. Check database connection
3. Try manual delete via SQL

## ✅ Benefits

### Before
- ❌ Manual CLI commands
- ❌ Edit config files manually
- ❌ No visual feedback
- ❌ Hard to track progress

### After
- ✅ GUI-based setup
- ✅ Visual progress bar
- ✅ Real-time status
- ✅ Easy project management
- ✅ One-click indexing

## 🎉 Summary

Sekarang Anda bisa:
1. **Add project** via GUI form
2. **Index project** dengan progress bar
3. **Re-index** saat ada perubahan
4. **Delete project** dengan konfirmasi
5. **Monitor progress** secara visual

Semua dari dashboard yang user-friendly! 🚀

---

**Dashboard:** http://localhost:3000  
**Tab:** Projects  
**Features:** Add, Index, Re-index, Delete
