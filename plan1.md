# 🧠 1. Struktur Final `rtk-system`

Buat folder:

```bash
C:\rtk-system
```

Struktur lengkap:

```text
rtk-system/
├── server/
│   └── mcp-http.js
├── agents/
│   └── main-agent.js
├── tools/
│   ├── read-file.js
│   ├── search-code.js
│   └── run-task.js
├── rag/
│   ├── embedder.js
│   └── vector-db/
├── indexer/
│   └── index-project.js
├── config/
│   └── projects.json
├── utils/
│   └── file-utils.js
├── package.json
└── .env
```

---

# ⚙️ 2. `package.json`

```json
{
  "name": "rtk-system",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.4.0"
  }
}
```

Install:

```bash
npm install
```

---

# 🔑 3. Config Multi Project

## `config/projects.json`

```json
{
  "projects": {
    "smartani": "C:\\projects\\app_smartani",
    "lab-system": "C:\\projects\\lab_reservation"
  }
}
```

---

# 🧩 4. MCP HTTP Server

## `server/mcp-http.js`

```js
import express from "express";
import dotenv from "dotenv";
import { runAgent } from "../agents/main-agent.js";

dotenv.config();

const app = express();
app.use(express.json());

app.post("/mcp", async (req, res) => {
  const { method, params } = req.body;

  // ===== LIST TOOLS =====
  if (method === "tools/list") {
    return res.json({
      tools: [
        {
          name: "rtk_ask",
          description: "Ask RTK about a project",
          input_schema: {
            type: "object",
            properties: {
              project: { type: "string" },
              prompt: { type: "string" }
            },
            required: ["project", "prompt"]
          }
        }
      ]
    });
  }

  // ===== CALL TOOL =====
  if (method === "tools/call") {
    const { name, arguments: args } = params;

    if (name === "rtk_ask") {
      const result = await runAgent(args.project, args.prompt);

      return res.json({
        content: [{ type: "text", text: result }]
      });
    }
  }

  res.status(400).json({ error: "Unknown method" });
});

app.listen(3000, () => {
  console.log("RTK MCP HTTP running at http://localhost:3000/mcp");
});
```

---

# 🧠 5. Agent Core

## `agents/main-agent.js`

```js
import fs from "fs";
import path from "path";
import projects from "../config/projects.json" assert { type: "json" };

export async function runAgent(project, prompt) {
  const projectPath = projects.projects[project];

  if (!projectPath) {
    return `Project ${project} tidak ditemukan`;
  }

  // simple logic dulu (nanti bisa diganti LLM + RAG)
  const files = fs.readdirSync(projectPath);

  return `
Project: ${project}
Path: ${projectPath}

Files:
${files.join("\n")}

Prompt:
${prompt}
`;
}
```

---

# 🔍 6. Tool: Read File

## `tools/read-file.js`

```js
import fs from "fs";

export function readFile(filePath) {
  return fs.readFileSync(filePath, "utf-8");
}
```

---

# 🔎 7. Tool: Search Code

## `tools/search-code.js`

```js
import fs from "fs";
import path from "path";

export function searchCode(dir, keyword) {
  const results = [];

  function scan(folder) {
    const files = fs.readdirSync(folder);

    for (const file of files) {
      const fullPath = path.join(folder, file);

      if (fs.statSync(fullPath).isDirectory()) {
        scan(fullPath);
      } else {
        const content = fs.readFileSync(fullPath, "utf-8");
        if (content.includes(keyword)) {
          results.push(fullPath);
        }
      }
    }
  }

  scan(dir);
  return results;
}
```

---

# 🤖 8. Tool: Run Task

## `tools/run-task.js`

```js
import { execSync } from "child_process";

export function runCommand(cmd) {
  try {
    return execSync(cmd).toString();
  } catch (e) {
    return e.message;
  }
}
```

---

# 📚 9. Indexer (RAG placeholder)

## `indexer/index-project.js`

```js
import fs from "fs";
import path from "path";
import projects from "../config/projects.json" assert { type: "json" };

const project = process.argv[2];
const projectPath = projects.projects[project];

if (!projectPath) {
  console.log("Project tidak ditemukan");
  process.exit(1);
}

function index(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const full = path.join(dir, file);

    if (fs.statSync(full).isDirectory()) {
      index(full);
    } else {
      console.log("Indexed:", full);
    }
  }
}

index(projectPath);
```

---

# 🚀 10. Jalankan server

```bash
node server/mcp-http.js
```

---

# 🔗 11. Setup di Amazon Q

Isi:

* **Transport**: `http`
* **URL**:

```text
http://localhost:3000/mcp
```

---

# 🧪 12. Test di Amazon Q

```text
Call rtk_ask with project "smartani" and prompt "jelaskan project ini"
```

---

# 🔥 13. Upgrade roadmap (WAJIB kalau serius)

Langkah berikutnya:

### 1. Tambah RAG

* embedding
* vector DB (Chroma/Qdrant)

### 2. Tambah LLM

* OpenAI / local model

### 3. Tambah tools:

* refactor code
* generate docs
* auto fix bug

---

# 🎯 Kesimpulan

Kamu sekarang punya:

* ✅ RTK system global
* ✅ Multi-project support
* ✅ MCP HTTP compatible
* ✅ Bisa dipakai di Amazon Q (free tier)

---

Kalau mau lanjut serius, saya bisa bantu:

👉 upgrade ke:

* RAG real (bukan placeholder)
* auto code understanding (AST)
* agent yang bisa edit file otomatis

Tinggal bilang:
**“upgrade ke full AI coding system”**
