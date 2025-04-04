const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

// Same secret key as in superset_config.py
const JWT_SECRET = 'i4XAjRc19/yr6Kn/RfPE5U8kWL9y+RoWFsGhRZC3+I+2otcwTuG5iDnP';

// Create a token with minimal claims
const token = jwt.sign({
  user: {
    username: 'guest',
    first_name: 'Guest',
    last_name: 'User',
    email: 'guest@example.com'
  },
  resources: [{
    type: 'dashboard',
    id: '1f48395c-cc6c-45a3-8f8b-3f722bbff31c'
  }]
}, JWT_SECRET, {
  algorithm: 'HS256',
  expiresIn: '1h',
  audience: 'embedded'
});

console.log('Generated token:', token);

// Test the token with multiple API endpoints
async function testToken() {
  const endpoints = [
    '/api/v1/me/',
    '/api/v1/security/guest_token/',
    '/api/v1/dashboard/1f48395c-cc6c-45a3-8f8b-3f722bbff31c/'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\nTesting endpoint: ${endpoint}`);
      const response = await fetch(`http://localhost:8088${endpoint}`, {
        headers: {
          'X-GuestToken': token
        }
      });
      
      const data = await response.json();
      console.log('Response:', data);
    } catch (error) {
      console.error('API error:', error);
    }
  }
}

testToken(); 