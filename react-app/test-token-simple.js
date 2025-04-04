const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

// Same secret key as in superset_config.py
const JWT_SECRET = 'i4XAjRc19/yr6Kn/RfPE5U8kWL9y+RoWFsGhRZC3+I+2otcwTuG5iDnP';

// Create a minimal token
const token = jwt.sign({
  // Only include the absolute essentials
  sub: 'guest',
  aud: 'embedded',
  resources: [{
    type: 'dashboard',
    id: '1f48395c-cc6c-45a3-8f8b-3f722bbff31c'
  }]
}, JWT_SECRET, {
  algorithm: 'HS256',
  expiresIn: '1h'
});

console.log('Generated token:', token);

// Test the token with a direct API call
async function testToken() {
  try {
    const response = await fetch('http://localhost:8088/api/v1/me/', {
      headers: {
        'X-GuestToken': token
      }
    });
    
    const data = await response.json();
    console.log('Me API response:', data);
  } catch (error) {
    console.error('API error:', error);
  }
}

testToken(); 