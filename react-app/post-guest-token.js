const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

// Same secret key as in superset_config.py
const JWT_SECRET = 'i4XAjRc19/yr6Kn/RfPE5U8kWL9y+RoWFsGhRZC3+I+2otcwTuG5iDnP';

// Create a token
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

// Test POST request to guest token endpoint
async function testPostGuestToken() {
  try {
    console.log('\nTesting POST to /api/v1/security/guest_token/');
    const response = await fetch('http://localhost:8088/api/v1/security/guest_token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-GuestToken': token
      },
      body: JSON.stringify({
        resources: [{
          type: 'dashboard',
          id: '1f48395c-cc6c-45a3-8f8b-3f722bbff31c'
        }]
      })
    });
    
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('API error:', error);
  }
}

testPostGuestToken(); 