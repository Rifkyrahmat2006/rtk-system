Ini error yang sangat jelas dan spesifik:

> **“Invalid content type, expected `text/event-stream`”**

👉 Artinya:

> Amazon Q mengharapkan **MCP HTTP dengan streaming (SSE)**
> tapi server kamu masih pakai **JSON biasa (Express default)**

---

# 🧠 1. Akar masalah

Server kamu sekarang:

```http
Content-Type: application/json ❌
```

Yang diminta Amazon Q:

```http
Content-Type: text/event-stream ✅
```

👉 Ini standar **Server-Sent Events (SSE)**
👉 MCP HTTP = **streaming protocol**, bukan REST biasa

---

# ⚙️ 2. Solusi: ubah server jadi SSE

Kita ubah `mcp-http.js` jadi streaming.

---

## 🔧 FIX FULL (WAJIB GANTI)

### `server/mcp-http.js`

```js
import express from "express";

const app = express();
app.use(express.json());

// ===== SSE ENDPOINT =====
app.post("/mcp", async (req, res) => {
  // WAJIB untuk MCP
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const { method, params } = req.body;

  function send(data) {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  // ===== LIST TOOLS =====
  if (method === "tools/list") {
    send({
      tools: [
        {
          name: "rtk_ask",
          description: "Ask RTK about project",
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

    return res.end();
  }

  // ===== CALL TOOL =====
  if (method === "tools/call") {
    const { name, arguments: args } = params;

    if (name === "rtk_ask") {
      const result = `RTK response: ${args.prompt}`;

      send({
        content: [{ type: "text", text: result }]
      });

      return res.end();
    }
  }

  send({ error: "Unknown method" });
  res.end();
});

app.listen(3000, () => {
  console.log("RTK MCP SSE running at http://localhost:3000/mcp");
});
```

---

# 🔥 3. Kenapa harus SSE?

Amazon Q MCP HTTP:

* pakai **streaming response**
* bisa kirim progress (agentic behavior)
* bukan request-response biasa

👉 jadi:

> REST API biasa ❌
> SSE streaming ✅

---

# 🧪 4. Cara test SSE (penting)

Jalankan:

```bash
curl -N -X POST http://localhost:3000/mcp \ -H "Content-Type: application/json" \ -d "{\"method\":\"tools/list\"}"
```

👉 output harus:

```text
data: {"tools":[...]}
```

---

# ⚠️ 5. Error umum setelah ini

### ❌ lupa `\n\n`

→ SSE tidak terbaca

### ❌ tidak pakai `res.write`

→ tidak streaming

### ❌ tidak set header

→ error tetap muncul

---

# 🚀 6. Setelah fix

Kembali ke Amazon Q:

* klik Save lagi
* atau reload VS Code

---

# 🎯 7. Hasil yang diharapkan

* error hilang ✅
* MCP tersambung ✅
* Q bisa detect `rtk_ask` ✅

---

# 🧠 Insight penting

Ini yang sering tidak disadari:

> MCP HTTP ≠ REST API
> MCP HTTP = streaming protocol (SSE)

---

# 🚀 Next step (kalau mau lebih canggih)

Kita bisa upgrade:

* streaming progress:

  ```js
  send({ status: "indexing..." });
  ```
* multi-step agent
* real-time refactor

---

Kalau kamu mau, saya bisa bantu:

👉 bikin **RTK MCP server yang full streaming + multi-agent + progress UI**

Tinggal bilang:
**“upgrade ke streaming agent real-time”**
