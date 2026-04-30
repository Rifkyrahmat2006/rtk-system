import http from "http";

function callMCP(method, params = {}) {
  return new Promise((resolve, reject) => {
    let output = "";

    const sseReq = http.get("http://localhost:3000/mcp", (sseRes) => {
      sseRes.on("data", (chunk) => {
        const raw = chunk.toString();
        output += raw;

        const match = raw.match(/clientId=(\d+)/);
        if (match) {
          const clientId = match[1];
          if (!/^\d+$/.test(clientId)) return;
          const body = JSON.stringify({ id: 1, method, params });
          const postReq = http.request(
            {
              hostname: "localhost", port: 3000,
              path: `/mcp/message?clientId=${encodeURIComponent(clientId)}`,
              method: "POST",
              headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
            },
            (r) => { let d = ""; r.on("data", (c) => (d += c)); r.on("end", () => {}); }
          );
          postReq.write(body);
          postReq.end();
        }

        if (output.includes('"result"')) {
          const dataMatch = output.match(/data: (\{.*\})/);
          if (dataMatch) {
            try { resolve(JSON.parse(dataMatch[1])); } catch { resolve(output); }
          }
          sseReq.destroy();
        }
      });
    });

    sseReq.on("error", reject);
    setTimeout(() => reject(new Error("timeout")), 6000);
  });
}

async function runTests() {
  console.log("=".repeat(60));
  console.log("  RTK-SYSTEM MCP SERVER - FULL FEATURE TEST");
  console.log("  URL: http://localhost:3000/mcp");
  console.log("=".repeat(60));

  // TEST 1: tools/list
  console.log("\n[TEST 1] tools/list - Daftar tools yang tersedia");
  console.log("-".repeat(60));
  try {
    const res = await callMCP("tools/list");
    const tools = res.result?.tools || [];
    console.log(`✓ Ditemukan ${tools.length} tool(s):`);
    tools.forEach((t) => {
      console.log(`  - ${t.name}: ${t.description}`);
      console.log(`    Required params: ${t.inputSchema?.required?.join(", ")}`);
    });
  } catch (e) {
    console.log("✗ Error:", e.message);
  }

  // TEST 2: rtk_ask - project valid
  console.log("\n[TEST 2] rtk_ask - project 'smartani', prompt 'list files'");
  console.log("-".repeat(60));
  try {
    const res = await callMCP("tools/call", { name: "rtk_ask", arguments: { project: "smartani", prompt: "list files" } });
    const text = res.result?.content?.[0]?.text || JSON.stringify(res.result);
    console.log("✓ Response:\n" + text);
  } catch (e) {
    console.log("✗ Error:", e.message);
  }

  // TEST 3: rtk_ask - project lain
  console.log("\n[TEST 3] rtk_ask - project 'lab-system', prompt 'list files'");
  console.log("-".repeat(60));
  try {
    const res = await callMCP("tools/call", { name: "rtk_ask", arguments: { project: "lab-system", prompt: "list files" } });
    const text = res.result?.content?.[0]?.text || JSON.stringify(res.result);
    console.log("✓ Response:\n" + text);
  } catch (e) {
    console.log("✗ Error:", e.message);
  }

  // TEST 4: rtk_ask - project tidak ada
  console.log("\n[TEST 4] rtk_ask - project tidak dikenal 'unknown-project'");
  console.log("-".repeat(60));
  try {
    const res = await callMCP("tools/call", { name: "rtk_ask", arguments: { project: "unknown-project", prompt: "test" } });
    const text = res.result?.content?.[0]?.text || JSON.stringify(res.result);
    console.log("✓ Response:\n" + text);
  } catch (e) {
    console.log("✗ Error:", e.message);
  }

  // TEST 5: method tidak dikenal
  console.log("\n[TEST 5] Unknown method - 'tools/unknown'");
  console.log("-".repeat(60));
  try {
    const res = await callMCP("tools/unknown");
    console.log("✓ Response:", JSON.stringify(res.result));
  } catch (e) {
    console.log("✗ Error:", e.message);
  }

  console.log("\n" + "=".repeat(60));
  console.log("  TEST SELESAI");
  console.log("=".repeat(60));
}

runTests();
