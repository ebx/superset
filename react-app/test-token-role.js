const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

// Same secret key as in superset_config.py
const JWT_SECRET = 'i4XAjRc19/yr6Kn/RfPE5U8kWL9y+RoWFsGhRZC3+I+2otcwTuG5iDnP';

// Create a token with explicit role information
const token = jwt.sign({
  // Standard JWT claims
  iss: 'superset',
  sub: 'guest',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
  aud: 'embedded',
  
  // Superset-specific claims
  user: {
    username: 'guest',
    first_name: 'Guest',
    last_name: 'User',
    role_name: 'Public'  // Try adding role_name directly to user
  },
  resources: [{
    type: 'dashboard',
    id: '1f48395c-cc6c-45a3-8f8b-3f722bbff31c'
  }]
  // No roles array, use role_name in user object instead
}, JWT_SECRET, {
  algorithm: 'HS256'
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
    
    // Try accessing the dashboard info
    const dashboardResponse = await fetch('http://localhost:8088/api/v1/dashboard/1f48395c-cc6c-45a3-8f8b-3f722bbff31c/', {
      headers: {
        'X-GuestToken': token
      }
    });
    
    const dashboardData = await dashboardResponse.json();
    console.log('Dashboard API response:', dashboardData);
  } catch (error) {
    console.error('API error:', error);
  }
}

testToken(); 