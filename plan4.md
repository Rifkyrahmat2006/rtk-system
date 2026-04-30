Berikut **PRD (Product Requirements Document)** khusus untuk **upgrade integrasi MySQL ke RTK AI Coding System (v4 → v5)**. Fokusnya: menjadikan sistem kamu **stateful, traceable, dan siap menuju autonomous agent (Phase 3)**.

---

# 📄 PRD — RTK v5.0 (MySQL Integration Layer)

## 1. 🎯 Objective

Mengintegrasikan **database MySQL** ke RTK system untuk:

* menyimpan **task memory (agent state)**
* menyediakan **audit trail perubahan kode**
* mengelola **metadata project & indexing**
* memungkinkan **resume task & multi-session AI**

---

## 2. 🧩 Problem Statement

Sistem saat ini (v4.0):

* ❌ stateless (tidak ada memory)
* ❌ tidak bisa resume task
* ❌ tidak ada histori perubahan
* ❌ tidak ada tracking aktivitas AI
* ❌ tidak ada observability sistem

👉 Dampaknya:

* automation tidak bisa berkelanjutan
* sulit debugging AI action
* tidak aman untuk real-world usage

---

## 3. 👥 Target User

* Developer individu (power user)
* Tim kecil (AI-assisted workflow)
* Research / experimental AI coding system

---

## 4. 🏗️ Scope

## IN SCOPE

* MySQL database integration
* Task memory system
* Activity logging
* Project metadata
* MCP tools untuk monitoring

## OUT OF SCOPE

* distributed system
* multi-user RBAC kompleks
* UI dashboard (sementara via MCP)

---

# 🧠 5. Core Features

---

## 🔥 Feature 1 — Task Memory (Agent State)

### Deskripsi

Menyimpan state dari setiap task AI (Phase 3 readiness)

### Data Model

```json
{
  "id": "uuid",
  "project": "smartani",
  "goal": "refactor auth",
  "status": "in-progress",
  "current_step": 2,
  "steps": [...],
  "created_at": "timestamp"
}
```

### Acceptance Criteria

* task bisa disimpan & di-load ulang
* bisa resume dari step terakhir
* status selalu update

---

## 🔥 Feature 2 — Activity Logging (Audit Trail)

### Deskripsi

Mencatat semua aksi AI

### Contoh log

* file diubah
* commit dibuat
* patch dijalankan

### Acceptance Criteria

* setiap tool call tercatat
* log bisa difilter per project
* log timestamp akurat

---

## 🔥 Feature 3 — Project Metadata Management

### Deskripsi

Menyimpan info project

### Data

* project name
* path
* tech stack
* last indexed

### Acceptance Criteria

* project bisa didaftarkan via DB
* tidak hardcode lagi di JSON

---

## 🔥 Feature 4 — File Index Tracking

### Deskripsi

Tracking file yang sudah di-index

### Tujuan

* incremental indexing
* tidak re-index semua file

### Acceptance Criteria

* detect file change
* update index hanya file berubah

---

## 🔥 Feature 5 — Monitoring MCP Tools

### Tools baru

```text
rtk_task_status
rtk_task_list
rtk_activity_logs
rtk_project_list
```

### Acceptance Criteria

* bisa query dari Amazon Q
* response < 1 detik

---

# 🗄️ 6. Database Schema

## projects

```sql
CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE,
  path TEXT,
  tech_stack VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## tasks

```sql
CREATE TABLE tasks (
  id VARCHAR(100) PRIMARY KEY,
  project VARCHAR(100),
  goal TEXT,
  status VARCHAR(50),
  current_step INT,
  steps JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## activity_logs

```sql
CREATE TABLE activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project VARCHAR(100),
  action VARCHAR(100),
  file_path TEXT,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## file_index

```sql
CREATE TABLE file_index (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project VARCHAR(100),
  file_path TEXT,
  last_indexed TIMESTAMP,
  embedding_id VARCHAR(100)
);
```

---

# 🧱 7. Technical Architecture

```text
Amazon Q
   ↓
MCP Server
   ↓
┌──────────────┬──────────────┬──────────────┐
│ RAG Engine   │ MySQL DB     │ Tool System  │
│ (semantic)   │ (state)      │ (write/git)  │
└──────────────┴──────────────┴──────────────┘
```

---

# ⚙️ 8. Non-Functional Requirements

| Category        | Requirement      |
| --------------- | ---------------- |
| Performance     | query < 1 detik  |
| Reliability     | no data loss     |
| Security        | basic API key    |
| Scalability     | multi-project    |
| Maintainability | modular DB layer |

---

# ⚠️ 9. Risks & Mitigation

| Risk               | Mitigation     |
| ------------------ | -------------- |
| DB overload        | indexing async |
| data inconsistency | transaction    |
| log flooding       | batching       |
| security           | API key        |

---

# 🛣️ 10. Roadmap

## Phase 2.5 (This PRD)

* MySQL connection
* schema setup
* basic CRUD

## Phase 3 readiness

* task memory integration
* logging system

## Phase 3

* autonomous agent
* multi-step execution

---

# 📊 11. Success Metrics

* ✅ task bisa resume
* ✅ log semua action tersimpan
* ✅ query DB < 1 detik
* ✅ error rate < 5%
* ✅ incremental indexing jalan

---

# 🎯 12. Expected Outcome

Setelah implementasi:

Dari:

```text
AI Coding Tool
```

Menjadi:

```text
AI Coding Platform (Stateful + Trackable)
```

---

# 🧠 Final Insight

Tanpa MySQL:

> AI kamu pintar tapi pelupa

Dengan MySQL:

> AI kamu mulai “punya ingatan & histori”
