#!/usr/bin/env node

/**
 * Quick Start Script for MongoDB Vector Search
 * 
 * This script helps you quickly set up and test your AI integration
 */

const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

async function indexAllData() {
  console.log('🚀 Starting data indexing...\n');

  try {
    // Index content
    console.log('📚 Indexing all content...');
    const contentRes = await axios.post(`${BASE_URL}/ai/index-all/content`);
    console.log('✅ Content indexed:', contentRes.data.message);

    // Index blogs
    console.log('\n📝 Indexing all blogs...');
    const blogRes = await axios.post(`${BASE_URL}/ai/index-all/blog`);
    console.log('✅ Blogs indexed:', blogRes.data.message);

    // Index technologies
    console.log('\n💻 Indexing all technologies...');
    const techRes = await axios.post(`${BASE_URL}/ai/index-all/technology`);
    console.log('✅ Technologies indexed:', techRes.data.message);

    console.log('\n🎉 All data indexed successfully!');
    console.log('\n📍 You can now ask questions at: POST /ai/ask');
  } catch (error) {
    console.error('\n❌ Error indexing data:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

async function testAI(question) {
  console.log(`\n🤖 Asking: "${question}"\n`);

  try {
    const response = await axios.post(`${BASE_URL}/ai/ask`, {
      question: question,
    });

    console.log('📖 Answer:');
    console.log(response.data.data);
    console.log('\n✅ AI is working!');
  } catch (error) {
    console.error('\n❌ Error asking question:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Main
const command = process.argv[2];

if (command === 'index') {
  indexAllData();
} else if (command === 'test') {
  const question = process.argv[3] || 'What technologies do you have information about?';
  testAI(question);
} else {
  console.log(`
MongoDB Vector Search - Quick Start

Usage:
  node scripts/quickstart.js index                 # Index all your data
  node scripts/quickstart.js test                  # Test with a default question
  node scripts/quickstart.js test "Your question"  # Test with your own question

Examples:
  node scripts/quickstart.js index
  node scripts/quickstart.js test
  node scripts/quickstart.js test "What is Angular?"

Environment Variables:
  API_URL    Base URL of your API (default: http://localhost:3000)
`);
}
