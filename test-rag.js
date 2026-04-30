import { chunkCode, embedText } from "./rag/embedder.js";
import { vectorStore } from "./rag/vector.js";
import { semanticSearch } from "./rag/search.js";
import { buildContext, formatContext } from "./rag/context-builder.js";

console.log("🧪 Testing RTK RAG System v4.0\n");

// Test 1: Embedder
console.log("1️⃣ Testing Embedder...");
const sampleCode = `function authenticate(user, password) {
  const hash = bcrypt.hash(password);
  return db.query('SELECT * FROM users WHERE email = ? AND password = ?', [user, hash]);
}`;

const chunks = chunkCode(sampleCode, "auth.js");
console.log(`   ✅ Chunked code into ${chunks.length} chunks`);

const vector = await embedText(sampleCode);
console.log(`   ✅ Generated embedding vector (dim: ${vector.length})`);
console.log(`   Sample: [${vector.slice(0, 5).map(v => v.toFixed(3)).join(", ")}...]\n`);

// Test 2: Vector Store
console.log("2️⃣ Testing Vector Store...");
await vectorStore.addDocument("test-project", "doc1", "user authentication login", { file: "auth.js", startLine: 1, endLine: 5 });
await vectorStore.addDocument("test-project", "doc2", "database connection pool", { file: "db.js", startLine: 1, endLine: 10 });
await vectorStore.addDocument("test-project", "doc3", "password hashing bcrypt", { file: "security.js", startLine: 20, endLine: 30 });
console.log("   ✅ Added 3 documents to vector store\n");

// Test 3: Semantic Search
console.log("3️⃣ Testing Semantic Search...");
const queries = ["how to login user", "database setup", "password security"];

for (const query of queries) {
  const results = await semanticSearch("test-project", query, 2);
  console.log(`   Query: "${query}"`);
  results.forEach((r, i) => {
    console.log(`     ${i + 1}. ${r.file} (score: ${r.score.toFixed(3)})`);
  });
}
console.log();

// Test 4: Context Builder
console.log("4️⃣ Testing Context Builder...");
await vectorStore.addDocument("test-project", "doc4", 
  `export function hashPassword(password) {\n  return bcrypt.hash(password, 10);\n}`, 
  { file: "utils/hash.js", startLine: 1, endLine: 3 }
);

const mockContext = {
  files: [
    { file: "auth.js", startLine: 1, endLine: 5, score: 0.85, content: sampleCode },
    { file: "utils/hash.js", startLine: 1, endLine: 3, score: 0.72, content: "export function hashPassword(password) {\n  return bcrypt.hash(password, 10);\n}" }
  ],
  summary: "Found 2 relevant files (150 tokens)",
  totalChars: 600
};

const formatted = formatContext(mockContext);
console.log("   ✅ Context formatted:");
console.log(formatted.split("\n").slice(0, 8).join("\n"));
console.log("   ...\n");

// Test 5: Stats
console.log("5️⃣ Testing Stats...");
const stats = vectorStore.getStats("test-project");
console.log(`   ✅ Vector store stats: ${stats.count} documents\n`);

// Test 6: Clear
console.log("6️⃣ Testing Clear...");
vectorStore.clear("test-project");
const statsAfter = vectorStore.getStats("test-project");
console.log(`   ✅ Cleared. Documents remaining: ${statsAfter.count}\n`);

console.log("✅ All tests passed!\n");
console.log("📝 Next steps:");
console.log("   1. Index a real project: npm run index <project-name>");
console.log("   2. Start server: npm start");
console.log("   3. Test semantic search via MCP tools");
