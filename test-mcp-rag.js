import fetch from "node-fetch";

const BASE_URL = "http://localhost:3000/mcp";

async function testMCP(toolName, params) {
  console.log(`\n🔧 Testing: ${toolName}`);
  console.log(`   Params:`, JSON.stringify(params, null, 2));
  
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name: toolName, arguments: params }
    })
  });

  const result = await response.json();
  
  if (result.error) {
    console.log(`   ❌ Error:`, result.error);
    return;
  }
  
  const text = result.result?.content?.[0]?.text || "No content";
  console.log(`   ✅ Result (${text.length} chars):`);
  console.log(text.split("\n").slice(0, 15).join("\n"));
  if (text.split("\n").length > 15) console.log("   ...");
}

console.log("🧪 Testing RTK MCP v4.0 Server\n");
console.log("⚠️  Make sure server is running: npm start\n");

// Wait a bit for server to be ready
await new Promise(resolve => setTimeout(resolve, 1000));

try {
  // Test 1: Check index stats
  await testMCP("rtk_index_stats", { project: "smartani" });

  // Test 2: Semantic search
  await testMCP("rtk_semantic_search", { 
    project: "smartani", 
    query: "user authentication login",
    topK: 3
  });

  // Test 3: rtk_ask with RAG
  await testMCP("rtk_ask", {
    project: "smartani",
    prompt: "bagaimana cara authentication bekerja?"
  });

  console.log("\n✅ All MCP tests passed!");
  
} catch (err) {
  console.error("\n❌ Error:", err.message);
  console.log("\n⚠️  Make sure server is running: npm start");
}
