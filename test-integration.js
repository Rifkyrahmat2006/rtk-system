import { vectorStore } from "./rag/vector.js";
import { semanticSearch } from "./rag/search.js";

console.log("🧪 Testing RTK v4.0 Integration\n");

// Test 1: Check indexed project
console.log("1️⃣ Checking indexed project...");
const stats = vectorStore.getStats("smartani");
console.log(`   ✅ Project 'smartani' has ${stats.count} chunks indexed\n`);

if (stats.count === 0) {
  console.log("   ⚠️  No index found. Run: npm run index smartani");
  process.exit(0);
}

// Test 2: Semantic search queries
console.log("2️⃣ Testing semantic search queries...\n");

const testQueries = [
  "authentication login user",
  "database connection",
  "API endpoint routes",
  "validation form input",
  "error handling"
];

for (const query of testQueries) {
  console.log(`   Query: "${query}"`);
  const results = await semanticSearch("smartani", query, 3);
  
  if (results.length === 0) {
    console.log("     ❌ No results\n");
    continue;
  }
  
  results.forEach((r, i) => {
    console.log(`     ${i + 1}. ${r.file} (L${r.startLine}-${r.endLine}) - score: ${r.score.toFixed(3)}`);
  });
  console.log();
}

// Test 3: Performance test
console.log("3️⃣ Performance test...");
const start = Date.now();
for (let i = 0; i < 10; i++) {
  await semanticSearch("smartani", "user authentication", 5);
}
const elapsed = Date.now() - start;
console.log(`   ✅ 10 searches completed in ${elapsed}ms (avg: ${(elapsed/10).toFixed(1)}ms)\n`);

// Test 4: Edge cases
console.log("4️⃣ Testing edge cases...");

// Empty query
const emptyResults = await semanticSearch("smartani", "", 5);
console.log(`   Empty query: ${emptyResults.length} results`);

// Very long query
const longQuery = "how to implement user authentication with password hashing and session management in a secure way with proper validation and error handling";
const longResults = await semanticSearch("smartani", longQuery, 5);
console.log(`   Long query: ${longResults.length} results`);

// Non-existent project
try {
  await semanticSearch("nonexistent", "test", 5);
  console.log(`   Non-existent project: handled gracefully\n`);
} catch (err) {
  console.log(`   Non-existent project: ${err.message}\n`);
}

console.log("✅ Integration tests complete!\n");
console.log("📝 Next: Start server and test via MCP");
console.log("   npm start");
