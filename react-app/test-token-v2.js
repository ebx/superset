const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

// Same secret key as in superset_config.py
const JWT_SECRET = 'i4XAjRc19/yr6Kn/RfPE5U8kWL9y+RoWFsGhRZC3+I+2otcwTuG5iDnP';

// Create a token based on Superset's documentation
const token = jwt.sign({
  // Standard claims
  iss: 'superset',
  sub: 'guest',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
  aud: 'embedded',
  
  // Superset-specific claims
  user: {
    username: 'guest',
    first_name: 'Guest',
    last_name: 'User'
  },
  resources: [{
    type: 'dashboard',
    id: '1f48395c-cc6c-45a3-8f8b-3f722bbff31c'
  }]
}, JWT_SECRET, {
  algorithm: 'HS256'
});

console.log('Generated token:', token);

// Test the token with a direct API call
async function testToken() {
  try {
    const response = await fetch('http://localhost:8088/api/v1/security/guest_token/', {
      headers: {
        'X-GuestToken': token
      }
    });
    
    const data = await response.json();
    console.log('API response:', data);
    
    // Try a different endpoint
    const meResponse = await fetch('http://localhost:8088/api/v1/me/', {
      headers: {
        'X-GuestToken': token
      }
    });
    
    const meData = await meResponse.json();
    console.log('Me API response:', meData);
  } catch (error) {
    console.error('API error:', error);
  }
}

testToken(); 