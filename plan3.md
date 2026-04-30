# 📄 PRD — RTK AI Coding System v4.0

## 1. 🎯 Objective

Membangun sistem **AI coding agent terintegrasi MCP** yang mampu:

- memahami codebase multi-project secara semantik (RAG)
- melakukan perubahan kode secara aman (write/refactor)
- menjalankan workflow otomatis (agent loop)
- terintegrasi dengan Amazon Q sebagai UI/trigger

---

## 2. 🧩 Problem Statement

Sistem saat ini (v3.0):

- hanya keyword-based (`rtk_search`)
- tidak punya pemahaman semantik
- belum bisa edit kode secara aman
- belum ada workflow agent multi-step
- belum ada memory task

👉 Dampaknya:

- AI belum “benar-benar ngerti project”
- automation masih manual dan terbatas

---

## 3. 👥 Target User

- Developer individu (seperti kamu)
- Tim kecil (2–5 orang)
- Mahasiswa / engineer yang ingin AI-assisted development

---

## 4. 🏗️ System Scope

## IN SCOPE

- RAG system (vector DB + embedding)
- Semantic search
- Code modification tools
- Multi-step agent
- Git integration
- Task memory

## OUT OF SCOPE (fase ini)

- UI dashboard (cukup via MCP + Q)
- Multi-user auth kompleks
- Cloud deployment

---

# 🧠 5. Core Features

---

## 🔥 Feature 1 — RAG Code Intelligence

### Deskripsi

Sistem memahami codebase menggunakan embedding + vector search

### Komponen

- Qdrant (vector DB)
- Embedder (OpenAI / local)
- Indexer (per project)

### Requirement

- Index semua file project
- Chunking max 2k chars
- Filter per project

### Acceptance Criteria

- Query “auth flow” → hasil relevan walau tidak ada keyword exact
- Response < 2 detik untuk project < 10k file

---

## 🔥 Feature 2 — Semantic Search

### Deskripsi

Menggantikan `rtk_search` berbasis keyword

### API Tool

```json
rtk_semantic_search(project, query)
```

### Acceptance Criteria

- Hasil lebih relevan dari string match
- Top 5 context akurat

---

## 🔥 Feature 3 — Code Modification Engine

### Tools

```json
rtk_write(file, content)
rtk_patch(file, diff)
rtk_refactor(file, instruction)
```

### Behavior

- generate diff dulu
- preview sebelum apply
- safe write

### Acceptance Criteria

- perubahan tidak merusak syntax
- bisa rollback

---

## 🔥 Feature 4 — Git Integration

### Tools

```json
rtk_git_diff
rtk_git_commit
rtk_git_branch
```

### Acceptance Criteria

- commit otomatis dengan message AI
- diff readable

---

## 🔥 Feature 5 — Multi-step Agent (Core AI)

### Deskripsi

Agent tidak hanya 1 action, tapi workflow

### Flow

```text
User prompt
   ↓
Planner
   ↓
Step list
   ↓
Executor (loop)
   ↓
Reviewer
```

### Acceptance Criteria

- agent bisa menyelesaikan task kompleks (refactor, bug fix)
- minimal 3-step reasoning

---

## 🔥 Feature 6 — Task Memory

### Deskripsi

Menyimpan state task

### Struktur

```json
{
  "task_id": "uuid",
  "goal": "refactor auth",
  "steps": [],
  "status": "in-progress"
}
```

### Acceptance Criteria

- bisa resume task
- state tersimpan antar request

---

## 🔥 Feature 7 — Context Builder

### Deskripsi

Pipeline untuk menggabungkan RAG + prompt

### Flow

```text
Prompt → RAG → Top files → Summarize → LLM
```

### Acceptance Criteria

- context tidak melebihi limit token
- relevansi tinggi

---

# 🧱 6. Technical Architecture

```text
Amazon Q
   ↓ MCP
RTK Server
   ↓
┌──────────────┬──────────────┬──────────────┐
│ RAG Engine   │ Agent System │ Tool Layer   │
│ (Qdrant)     │ (Planner)    │ (write/git)  │
└──────────────┴──────────────┴──────────────┘
```

---

# 🗂️ 7. Folder Structure (Upgrade)

```text
rtk-system/
├── agents/
│   ├── planner.js
│   ├── executor.js
│   └── reviewer.js
├── rag/
│   ├── embedder.js
│   ├── search.js
│   └── vector.js
├── tools/
│   ├── write.js
│   ├── git.js
│   └── test.js
├── memory/
│   └── task-store.js
```

---

# ⚙️ 8. Non-Functional Requirements

| Category        | Requirement        |
| --------------- | ------------------ |
| Performance     | < 2 detik response |
| Scalability     | multi-project      |
| Reliability     | auto restart (PM2) |
| Security        | API key minimal    |
| Maintainability | modular code       |

---

# ⚠️ 9. Risks & Mitigation

| Risk             | Mitigation                 |
| ---------------- | -------------------------- |
| LLM mahal        | gunakan hybrid (Q + local) |
| code rusak       | safe write + preview       |
| indexing lama    | incremental indexing       |
| context overflow | chunking + summarize       |

---

# 🛣️ 10. Roadmap (Prioritas Eksekusi)

## Phase 1 (WAJIB)

- RAG setup
- semantic search
- context builder

## Phase 2

- write/refactor tools
- git integration

## Phase 3

- multi-step agent
- task memory

## Phase 4 (optional)

- autonomous loop
- CI/CD integration

---

# 📊 11. Success Metrics

- 🔹 80% query menghasilkan context relevan
- 🔹 waktu analisis < 3 detik
- 🔹 50% task coding bisa di-automate
- 🔹 error rate < 10%

---

# 🎯 12. Final Outcome

Setelah implementasi:

Kamu punya sistem:

> ❌ bukan sekadar AI helper
> ✅ tapi **AI Coding Agent (semi-autonomous)**
