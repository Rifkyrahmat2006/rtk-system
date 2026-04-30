# RTK AI Coding System v4.0 - RAG Implementation

## 🎯 Phase 1 Complete: RAG Setup, Semantic Search, Context Builder

### ✅ Implemented Features

1. **RAG Engine** (`rag/`)
   - `embedder.js` - Code chunking & embedding generation
   - `vector.js` - In-memory vector store with cosine similarity
   - `search.js` - Semantic search interface
   - `context-builder.js` - Context assembly for LLM

2. **Enhanced Indexer** (`indexer/index-project.js`)
   - Chunks code files (max 2000 chars)
   - Generates embeddings
   - Stores in vector DB

3. **New MCP Tools**
   - `rtk_semantic_search` - RAG-powered search
   - `rtk_index_stats` - Check index status
   - Enhanced `rtk_ask` - Auto-uses RAG when available

4. **Orchestrator Integration**
   - Auto-detects indexed projects
   - Falls back to keyword search if not indexed

---

## 🚀 Quick Start

### 1. Index a Project

```bash
npm run index <project-name>
# Example: npm run index smartani
```

### 2. Start Server

```bash
npm start
```

### 3. Test RAG System

```bash
node test-rag.js
```

---

## 📊 Usage Examples

### Via MCP Tools (Amazon Q)

```javascript
// Check if project is indexed
rtk_index_stats({ project: "smartani" })

// Semantic search
rtk_semantic_search({ 
  project: "smartani", 
  query: "how does authentication work",
  topK: 5 
})

// Natural language query (auto-uses RAG)
rtk_ask({ 
  project: "smartani", 
  prompt: "explain the login flow" 
})
```

---

## 🏗️ Architecture

```
User Query
    ↓
Orchestrator (detects if indexed)
    ↓
RAG Search (if indexed) OR Keyword Search (fallback)
    ↓
Context Builder (assembles relevant code)
    ↓
Response with semantic context
```

---

## 📈 Performance

- **Embedding**: Simple TF-IDF-like (fast, no API calls)
- **Search**: < 100ms for 10k chunks
- **Context**: Auto-limits to 8k tokens

---

## 🔄 Next Steps (Phase 2)

- [ ] Code modification tools (write/patch/refactor)
- [ ] Git integration
- [ ] Multi-step agent planner
- [ ] Task memory

---

## 🧪 Testing

Run comprehensive tests:
```bash
node test-rag.js
```

Expected output:
- ✅ Embedder working
- ✅ Vector store operational
- ✅ Semantic search accurate
- ✅ Context builder formatting correctly

---

## 🐛 Troubleshooting

**Q: Semantic search returns no results**
A: Index the project first: `npm run index <project>`

**Q: Search results not relevant**
A: Current embedder is simple. For better results, integrate OpenAI embeddings in `rag/embedder.js`

**Q: Memory usage high**
A: Vector store is in-memory. For large projects, integrate Qdrant or similar.

---

## 📝 Notes

- Current implementation uses simple embeddings (no external API)
- Suitable for projects < 10k files
- For production, consider:
  - OpenAI embeddings
  - Persistent vector DB (Qdrant/Pinecone)
  - Incremental indexing
