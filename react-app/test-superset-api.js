const fetch = require('node-fetch');

async function testSupersetAPI() {
  try {
    console.log('Testing Superset API...');
    
    // Try to access the health endpoint
    const response = await fetch('http://localhost:8088/api/v1/health');
    
    console.log('Status:', response.status);
    
    const data = await response.text();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error accessing Superset API:', error);
  }
}

testSupersetAPI(); 