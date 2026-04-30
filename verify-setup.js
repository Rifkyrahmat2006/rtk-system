import * as Projects from './db/projects.js';
import * as FileIndex from './db/file-index.js';
import { getIndexStats } from './rag/search.js';
import { closePool } from './db/connection.js';

async function verifySetup() {
  console.log('🔍 Verifying RTK Setup for Smartani\n');
  console.log('='.repeat(50));
  
  try {
    // 1. Check database project
    console.log('\n1️⃣ Database Project Registration:');
    const project = await Projects.getProject('smartani');
    if (project) {
      console.log('   ✅ Project registered in database');
      console.log(`   📁 Path: ${project.path}`);
      console.log(`   🛠️  Tech Stack: ${project.tech_stack || 'Not specified'}`);
      console.log(`   📅 Created: ${project.created_at}`);
    } else {
      console.log('   ❌ Project not found in database');
    }
    
    // 2. Check RAG index
    console.log('\n2️⃣ RAG Vector Index:');
    const ragStats = getIndexStats('smartani');
    if (ragStats.count > 0) {
      console.log('   ✅ RAG index ready');
      console.log(`   📊 Total chunks: ${ragStats.count}`);
    } else {
      console.log('   ❌ RAG index not found');
    }
    
    // 3. Check file index stats
    console.log('\n3️⃣ File Index Statistics:');
    const fileStats = await FileIndex.getIndexStats('smartani');
    if (fileStats) {
      console.log('   ✅ File tracking initialized');
      console.log(`   📄 Total files: ${fileStats.total_files}`);
      console.log(`   📦 Total chunks: ${fileStats.total_chunks}`);
    } else {
      console.log('   ⚠️  File tracking not initialized (will be created on first index)');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('\n🎉 Setup Verification Complete!\n');
    
    console.log('📋 Next Steps:');
    console.log('   1. Start server: npm start');
    console.log('   2. Test with Amazon Q:');
    console.log('      @rtk_ask project: smartani, prompt: "explain project structure"');
    console.log('      @rtk_semantic_search project: smartani, query: "authentication"');
    console.log('      @rtk_project_list');
    console.log('      @rtk_activity_logs project: smartani');
    
    await closePool();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await closePool();
    process.exit(1);
  }
}

verifySetup();
