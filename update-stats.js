import * as FileIndex from './db/file-index.js';
import { closePool } from './db/connection.js';

async function updateStats() {
  try {
    console.log('📊 Updating index stats for smartani...');
    await FileIndex.updateIndexStats('smartani', 1753, 7612, true);
    console.log('✅ Index stats updated');
    await closePool();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateStats();
