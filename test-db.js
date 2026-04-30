import { initDatabase, closePool } from './db/index.js';
import * as Projects from './db/projects.js';
import * as Tasks from './db/tasks.js';
import * as ActivityLogs from './db/activity-logs.js';
import * as FileIndex from './db/file-index.js';

async function testDatabase() {
  console.log('🧪 Testing RTK v5.0 MySQL Integration\n');
  
  let passed = 0;
  let failed = 0;

  // Test 1: Database initialization
  try {
    await initDatabase();
    console.log('✅ Test 1: Database initialization');
    passed++;
  } catch (error) {
    console.error('❌ Test 1 failed:', error.message);
    failed++;
    return;
  }

  // Test 2: Create project
  try {
    await Projects.createProject('test-project', 'C:\\test\\path', 'Node.js');
    console.log('✅ Test 2: Create project');
    passed++;
  } catch (error) {
    console.error('❌ Test 2 failed:', error.message);
    failed++;
  }

  // Test 3: Get project
  try {
    const project = await Projects.getProject('test-project');
    if (project && project.name === 'test-project') {
      console.log('✅ Test 3: Get project');
      passed++;
    } else {
      throw new Error('Project not found');
    }
  } catch (error) {
    console.error('❌ Test 3 failed:', error.message);
    failed++;
  }

  // Test 4: Create task
  let taskId;
  try {
    taskId = await Tasks.createTask('test-project', 'Test goal', ['step1', 'step2']);
    console.log('✅ Test 4: Create task');
    passed++;
  } catch (error) {
    console.error('❌ Test 4 failed:', error.message);
    failed++;
  }

  // Test 5: Get task
  try {
    const task = await Tasks.getTask(taskId);
    if (task && task.goal === 'Test goal') {
      console.log('✅ Test 5: Get task');
      passed++;
    } else {
      throw new Error('Task not found');
    }
  } catch (error) {
    console.error('❌ Test 5 failed:', error.message);
    failed++;
  }

  // Test 6: Update task status
  try {
    await Tasks.updateTaskStatus(taskId, 'in-progress', 1);
    const task = await Tasks.getTask(taskId);
    if (task.status === 'in-progress' && task.current_step === 1) {
      console.log('✅ Test 6: Update task status');
      passed++;
    } else {
      throw new Error('Task not updated');
    }
  } catch (error) {
    console.error('❌ Test 6 failed:', error.message);
    failed++;
  }

  // Test 7: Log activity
  try {
    await ActivityLogs.logActivity('test-project', 'test_action', 'Test message', 'test.js', taskId);
    console.log('✅ Test 7: Log activity');
    passed++;
  } catch (error) {
    console.error('❌ Test 7 failed:', error.message);
    failed++;
  }

  // Test 8: Get activity logs
  try {
    const logs = await ActivityLogs.getActivityLogs('test-project', 10);
    if (logs.length > 0) {
      console.log('✅ Test 8: Get activity logs');
      passed++;
    } else {
      throw new Error('No logs found');
    }
  } catch (error) {
    console.error('❌ Test 8 failed:', error.message);
    failed++;
  }

  // Test 9: Track file index
  try {
    await FileIndex.trackFileIndex('test-project', 'test.js', 'abc123', 'embed-1', 5);
    console.log('✅ Test 9: Track file index');
    passed++;
  } catch (error) {
    console.error('❌ Test 9 failed:', error.message);
    failed++;
  }

  // Test 10: Get file index
  try {
    const fileIdx = await FileIndex.getFileIndex('test-project', 'test.js');
    if (fileIdx && fileIdx.file_hash === 'abc123') {
      console.log('✅ Test 10: Get file index');
      passed++;
    } else {
      throw new Error('File index not found');
    }
  } catch (error) {
    console.error('❌ Test 10 failed:', error.message);
    failed++;
  }

  // Test 11: Update index stats
  try {
    await FileIndex.updateIndexStats('test-project', 100, 500, true);
    console.log('✅ Test 11: Update index stats');
    passed++;
  } catch (error) {
    console.error('❌ Test 11 failed:', error.message);
    failed++;
  }

  // Test 12: Get index stats
  try {
    const stats = await FileIndex.getIndexStats('test-project');
    if (stats && stats.total_files === 100) {
      console.log('✅ Test 12: Get index stats');
      passed++;
    } else {
      throw new Error('Stats not found');
    }
  } catch (error) {
    console.error('❌ Test 12 failed:', error.message);
    failed++;
  }

  // Cleanup
  try {
    await Projects.deleteProject('test-project');
    console.log('\n🧹 Cleanup completed');
  } catch (error) {
    console.warn('⚠️ Cleanup warning:', error.message);
  }

  await closePool();

  console.log('\n' + '='.repeat(50));
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED!');
    process.exit(0);
  } else {
    console.log('❌ SOME TESTS FAILED');
    process.exit(1);
  }
}

testDatabase().catch(error => {
  console.error('💥 Test suite crashed:', error);
  process.exit(1);
});
