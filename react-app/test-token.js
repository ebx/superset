const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

// Same secret key as in superset_config.py
const JWT_SECRET = 'i4XAjRc19/yr6Kn/RfPE5U8kWL9y+RoWFsGhRZC3+I+2otcwTuG5iDnP';

// Create tokens with different audience values
async function generateAndTestToken(audience) {
  // Create a token with the specified audience
  const token = jwt.sign({
    // Standard JWT claims
    iss: 'superset',
    sub: 'guest',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    aud: audience,
    
    // Superset-specific claims
    user: {
      username: 'guest',
      first_name: 'Guest',
      last_name: 'User'
    },
    resources: [{
      type: 'dashboard',
      id: '13'
    }],
    roles: ['Public']
  }, JWT_SECRET, {
    algorithm: 'HS256'
  });
  
  console.log(`\nTesting with audience: "${audience}"`);
  console.log('Token:', token);
  
  // Test the token with the dashboard endpoint
  try {
    const response = await fetch(`http://localhost:8088/superset/dashboard/13/?standalone=true&guest_token=${token}`);
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    if (response.status === 200) {
      console.log('SUCCESS! Token works with this audience.');
      console.log(`Dashboard URL: http://localhost:8088/superset/dashboard/13/?standalone=true&guest_token=${token}`);
      return { success: true, token };
    } else {
      const text = await response.text();
      if (text.length > 500) {
        console.log('Response:', text.substring(0, 500) + '...');
      } else {
        console.log('Response:', text);
      }
      return { success: false };
    }
  } catch (error) {
    console.error('Error testing token:', error);
    return { success: false };
  }
}

// Try different audience values
async function tryDifferentAudiences() {
  const audiences = [
    'embedded',
    'superset',
    ['embedded'],
    ['superset'],
    ['embedded', 'superset'],
    null
  ];
  
  for (const audience of audiences) {
    const result = await generateAndTestToken(audience);
    if (result.success) {
      console.log('\n✅ FOUND WORKING TOKEN!');
      console.log('Use this token in your React component:');
      console.log(result.token);
      break;
    }
  }
}

tryDifferentAudiences(); 