import { writeFile, patchFile, rollback, previewDiff } from "./tools/code-modifier.js";
import { gitStatus, gitDiff, gitCommit, gitLog } from "./tools/git-tools.js";
import fs from "fs";
import path from "path";

console.log("\ud83e\uddea Testing RTK v4.0 Phase 2 - Code Modification & Git Tools\\n");
console.log("=".repeat(60));

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`\u2705 ${name}`);
    passed++;
  } catch (err) {
    console.log(`\u274c ${name}: ${err.message}`);
    failed++;
  }
}

async function asyncTest(name, fn) {
  try {
    await fn();
    console.log(`\u2705 ${name}`);
    passed++;
  } catch (err) {
    console.log(`\u274c ${name}: ${err.message}`);
    failed++;
  }
}

// Setup test environment
const TEST_PROJECT = "smartani";
const TEST_FILE = "test-rtk-phase2.txt";
const TEST_CONTENT = "Hello RTK Phase 2\\nThis is a test file\\nLine 3";

console.log("\\n\ud83d\udcdd Code Modification Tests\\n");

await asyncTest("Write new file", async () => {
  const result = await writeFile(TEST_PROJECT, TEST_FILE, TEST_CONTENT, { noBackup: true });
  if (!result.success) throw new Error("Write failed");
  if (result.size !== TEST_CONTENT.length) throw new Error("Size mismatch");
});

await asyncTest("Preview diff", async () => {
  const newContent = "Hello RTK Phase 2 UPDATED\\nThis is a test file\\nLine 3\\nLine 4";
  const diff = await previewDiff(TEST_PROJECT, TEST_FILE, newContent);
  if (diff.changes === 0) throw new Error("No changes detected");
});

await asyncTest("Patch file", async () => {
  const patches = [
    { oldText: "Hello RTK Phase 2", newText: "Hello RTK Phase 2 - Modified" },
    { oldText: "Line 3", newText: "Line 3 - Updated" }
  ];
  const result = await patchFile(TEST_PROJECT, TEST_FILE, patches);
  if (result.patchesApplied !== 2) throw new Error(`Expected 2 patches, got ${result.patchesApplied}`);
});

await asyncTest("Rollback file", async () => {
  const result = await rollback(TEST_PROJECT, TEST_FILE);
  if (!result.success) throw new Error("Rollback failed");
});

await asyncTest("Write with backup", async () => {
  const result = await writeFile(TEST_PROJECT, TEST_FILE, "Updated content");
  if (!result.backup) throw new Error("Backup not created");
});

console.log("\\n\ud83d\udd00 Git Integration Tests\\n");

await asyncTest("Git status", async () => {
  const status = await gitStatus(TEST_PROJECT);
  if (!status.branch) throw new Error("No branch detected");
  console.log(`   Branch: ${status.branch}, Files: ${status.files.length}`);
});

await asyncTest("Git diff", async () => {
  const diff = await gitDiff(TEST_PROJECT);
  console.log(`   Has diff: ${diff.hasDiff}`);
});

await asyncTest("Git log", async () => {
  const log = await gitLog(TEST_PROJECT, 5);
  if (log.count === 0) throw new Error("No commits found");
  console.log(`   Recent commits: ${log.count}`);
});

// Cleanup
console.log("\\n\ud83e\uddf9 Cleanup\\n");

await asyncTest("Delete test file", async () => {
  const projects = await import("./config/projects.json", { with: { type: "json" } });
  const root = path.resolve(projects.default.projects[TEST_PROJECT]);
  const testPath = path.join(root, TEST_FILE);
  
  if (fs.existsSync(testPath)) fs.unlinkSync(testPath);
  if (fs.existsSync(testPath + ".backup")) fs.unlinkSync(testPath + ".backup");
  if (fs.existsSync(testPath + ".deleted")) fs.unlinkSync(testPath + ".deleted");
});

console.log("\\n" + "=".repeat(60));
console.log(`\\n\ud83d\udcca Test Results: ${passed} passed, ${failed} failed\\n`);

if (failed === 0) {
  console.log("\ud83c\udf89 ALL PHASE 2 TESTS PASSED!");
  console.log("\\n\u2705 RTK v4.0 Phase 2 Implementation: COMPLETE");
  console.log("\\n\ud83d\udcdd Summary:");
  console.log("   - Code modification tools working");
  console.log("   - Git integration functional");
  console.log("   - Backup & rollback operational");
  console.log("   - All safety features active");
  console.log("\\n\ud83d\ude80 Ready for Phase 3!");
  process.exit(0);
} else {
  console.log("\u274c SOME TESTS FAILED");
  console.log("\\n\u26a0\ufe0f  Please review failed tests above");
  process.exit(1);
}
