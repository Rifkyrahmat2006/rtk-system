import * as Projects from './db/projects.js';
import { closePool } from './db/connection.js';

async function registerSmartani() {
  try {
    console.log('📝 Registering project smartani...');
    
    // Check if already exists
    const existing = await Projects.getProject('smartani');
    if (existing) {
      console.log('✅ Project smartani already registered');
      console.log(`   Path: ${existing.path}`);
      console.log(`   Tech Stack: ${existing.tech_stack || 'Not specified'}`);
    } else {
      // Register new project
      await Projects.createProject(
        'smartani',
        'D:\\02_Workspace\\02_Smart_Tani\\dev-smartani',
        'Node.js, Vue.js, MySQL'
      );
      console.log('✅ Project smartani registered successfully');
    }
    
    await closePool();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

registerSmartani();
