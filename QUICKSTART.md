# 🚀 RTK v4.0 Quick Start Guide

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Projects
Edit `config/projects.json`:
```json
{
  "projects": {
    "myproject": "C:\\path\\to\\your\\project"
  }
}
```

### 3. Index Your Project
```bash
npm run index myproject
```

Expected output:
```
🔍 Indexing project: myproject
📁 Path: C:\path\to\your\project

Indexed 10 files, 16 chunks...
...
✅ Done! Indexed 1234 files, 5678 chunks
💾 Saving to disk...
✅ Saved!
```

### 4. Start Server
```bash
npm start
```

Expected output:
```
RTK MCP v4.0 running at http://localhost:3000/mcp
Tools: rtk_ask, rtk_explore, rtk_search, rtk_read, rtk_semantic_search, rtk_index_stats, rtk_cache_clear
```

---

## Usage Examples

### Check Index Status
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"rtk_index_stats","arguments":{"project":"myproject"}}}'
```

### Semantic Search
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"rtk_semantic_search","arguments":{"project":"myproject","query":"authentication flow","topK":5}}}'
```

### Natural Language Query (with RAG)
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"rtk_ask","arguments":{"project":"myproject","prompt":"explain how database connection works"}}}'
```

---

## Via Amazon Q

Once server is running, use these commands in Amazon Q:

```
@rtk_index_stats project: myproject

@rtk_semantic_search project: myproject, query: "user authentication"

@rtk_ask project: myproject, prompt: "how does the login system work?"
```

---

## Testing

### Run All Tests
```bash
# Unit tests
node test-rag.js

# Integration tests
node test-integration.js

# Final comprehensive tests
node test-final.js
```

### Expected Results
All tests should pass:
```
🎉 ALL TESTS PASSED!
✅ RTK v4.0 Phase 1 Implementation: COMPLETE
```

---

## Troubleshooting

### Issue: "No results" from semantic search
**Solution:** Index the project first:
```bash
npm run index myproject
```

### Issue: Port 3000 already in use
**Solution:** Kill existing process:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /F /PID <PID>

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Issue: Index file too large
**Solution:** Current implementation stores in JSON. For large projects (>10k files), consider:
- Using external vector DB (Qdrant/Pinecone)
- Implementing chunked storage
- Filtering file types more aggressively

---

## Performance Tips

1. **Incremental Indexing**: Re-index only when code changes significantly
2. **Cache Results**: Frequently searched queries are cached automatically
3. **Adjust Chunk Size**: Edit `CHUNK_SIZE` in `rag/embedder.js` (default: 2000)
4. **Limit Context**: Adjust `MAX_CONTEXT_TOKENS` in `rag/context-builder.js` (default: 8000)

---

## What's Next?

Phase 1 (RAG) is complete. Next phases:

- **Phase 2**: Code modification tools (write/patch/refactor)
- **Phase 3**: Git integration (commit/diff/branch)
- **Phase 4**: Multi-step agent & task memory

---

## Support

For issues or questions:
1. Check `IMPLEMENTATION-REPORT.md` for detailed info
2. Review `README-RAG.md` for architecture details
3. Run `node test-final.js` to verify installation
