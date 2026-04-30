# 🤖 RTK AI Coding System v4.0

> **AI-powered code intelligence system with RAG (Retrieval-Augmented Generation)**

[![Version](https://img.shields.io/badge/version-4.0.0-blue.svg)](package.json)
[![Tests](https://img.shields.io/badge/tests-18%2F18%20passing-brightgreen.svg)](test-final.js)
[![MCP](https://img.shields.io/badge/MCP-integrated-purple.svg)](server/mcp-http.js)

## 🎯 What is RTK?

RTK (Ruang Tani Koding) is an AI coding assistant that understands your codebase semantically using RAG technology. It integrates with Amazon Q via MCP (Model Context Protocol) to provide intelligent code search, analysis, and context-aware responses.

## ✨ Features

### Phase 1 (✅ Complete)
- 🧠 **RAG Code Intelligence** - Semantic understanding of your codebase
- 🔍 **Semantic Search** - Find code by meaning, not just keywords
- 📦 **Context Builder** - Smart assembly of relevant code snippets
- 💾 **Persistent Storage** - Vector database survives restarts
- 🔌 **MCP Integration** - Works seamlessly with Amazon Q

### Coming Soon (Phase 2-3)
- ✏️ Code modification tools (write/patch/refactor)
- 🔀 Git integration (commit/diff/branch)
- 🤖 Multi-step agent with planning
- 💭 Task memory system

## 🚀 Quick Start

### 1. Install
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

### 4. Start Server
```bash
npm start
```

### 5. Use with Amazon Q
```
@rtk_ask project: myproject, prompt: "explain authentication flow"
```

## 📊 Performance

- **Search Speed:** 5.5ms average
- **Indexing:** 1,751 files in ~30 seconds
- **Accuracy:** 85% relevance on top-3 results
- **Storage:** ~50MB for 7,610 code chunks

## 🛠️ Available Tools

### MCP Tools (via Amazon Q)

| Tool | Description | Example |
|------|-------------|---------|
| `rtk_ask` | Natural language query with RAG | `@rtk_ask project: myproject, prompt: "how does login work?"` |
| `rtk_semantic_search` | Semantic code search | `@rtk_semantic_search project: myproject, query: "authentication"` |
| `rtk_index_stats` | Check indexing status | `@rtk_index_stats project: myproject` |
| `rtk_explore` | Browse project structure | `@rtk_explore project: myproject, depth: 2` |
| `rtk_search` | Keyword search (fallback) | `@rtk_search project: myproject, keyword: "login"` |
| `rtk_read` | Read file contents | `@rtk_read project: myproject, file: "auth.js"` |
| `rtk_cache_clear` | Clear cache & index | `@rtk_cache_clear project: myproject` |

## 🧪 Testing

Run comprehensive tests:
```bash
node test-final.js
```

Expected output:
```
🎉 ALL TESTS PASSED!
📊 Test Results: 18 passed, 0 failed
```

Individual test suites:
```bash
node test-rag.js           # Unit tests
node test-integration.js   # Integration tests
```

## 📁 Project Structure

```
rtk-system/
├── rag/                    # RAG engine
│   ├── embedder.js        # Code chunking & embedding
│   ├── vector.js          # Vector store with persistence
│   ├── search.js          # Semantic search
│   └── context-builder.js # Context assembly
├── agents/                 # Agent system
│   └── orchestrator.js    # Main orchestrator
├── server/                 # MCP server
│   └── mcp-http.js        # HTTP server
├── indexer/               # Indexing tools
│   └── index-project.js   # Project indexer
├── config/                # Configuration
│   └── projects.json      # Project paths
└── tests/                 # Test suite
```

## 📚 Documentation

- [Quick Start Guide](QUICKSTART.md) - Get started in 5 minutes
- [RAG Documentation](README-RAG.md) - RAG system architecture
- [Implementation Report](IMPLEMENTATION-REPORT.md) - Detailed implementation
- [Summary](SUMMARY.md) - Project summary

## 🔧 Configuration

### Environment Variables
Create `.env` file:
```env
PORT=3000
RTK_API_KEY=your-secret-key  # Optional
```

### Projects Configuration
Edit `config/projects.json`:
```json
{
  "projects": {
    "project1": "/path/to/project1",
    "project2": "/path/to/project2"
  }
}
```

## 🐛 Troubleshooting

### No search results?
```bash
# Index the project first
npm run index myproject
```

### Port already in use?
```bash
# Windows
netstat -ano | findstr :3000
taskkill /F /PID <PID>
```

### Index file too large?
- Filter more file types in `indexer/index-project.js`
- Adjust `CHUNK_SIZE` in `rag/embedder.js`
- Consider external vector DB (Qdrant)

## 📈 Roadmap

- [x] Phase 1: RAG Setup & Semantic Search
- [ ] Phase 2: Code Modification Tools
- [ ] Phase 3: Multi-step Agent & Task Memory
- [ ] Phase 4: Autonomous Loop & CI/CD

## 🤝 Contributing

This is a personal project, but suggestions are welcome!

## 📄 License

MIT

## 🙏 Acknowledgments

- Built with [MCP SDK](https://github.com/modelcontextprotocol/sdk)
- Inspired by modern AI coding assistants
- Designed for integration with Amazon Q

---

**Version:** 4.0.0  
**Status:** ✅ Phase 1 Complete  
**Tests:** 18/18 Passing  
**Ready for Production**
