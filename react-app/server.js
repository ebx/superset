const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const jwt = require('jsonwebtoken'); // Keep this for the test-token endpoint

const app = express();
const port = 5000;

// Add more detailed logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Same secret key as in superset_config.py
const JWT_SECRET = 'i4XAjRc19/yr6Kn/RfPE5U8kWL9y+RoWFsGhRZC3+I+2otcwTuG5iDnP';

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Cache the token to avoid making too many requests
let cachedToken = null;
let tokenExpiry = 0;

// Function to get CSRF token and session cookie
async function getCSRFToken() {
  try {
    const response = await fetch('http://localhost:8088/api/v1/security/csrf_token/', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch CSRF token:', response.status);
      return null;
    }

    const data = await response.json();
    // Get the session cookie from the response
    const cookies = response.headers.get('set-cookie');
    console.log('Response cookies:', cookies);

    if (data && data.result) {
      console.log('Got CSRF token from API');
      return {
        token: data.result,
        cookies: cookies
      };
    }

    console.error('No CSRF token in response:', data);
    return null;
  } catch (error) {
    console.error('Error getting CSRF token:', error);
    return null;
  }
}

// Update login function to handle session properly
async function loginAsAdmin() {
  try {
    // First get CSRF token
    const csrfResponse = await fetch('http://localhost:8088/api/v1/security/csrf_token/', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const csrfData = await csrfResponse.json();
    const csrfCookie = csrfResponse.headers.get('set-cookie');

    // Then login with the CSRF token
    const loginResponse = await fetch('http://localhost:8088/api/v1/security/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfData.result,
        'Cookie': csrfCookie
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin',
        provider: 'db'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginCookie = loginResponse.headers.get('set-cookie');
    const combinedCookies = [csrfCookie, loginCookie].filter(Boolean).join('; ');

    return {
      cookie: combinedCookies,
      csrf: csrfData.result
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

app.get('/api/guest-token', async (req, res) => {
  try {
    const payload = {
      user: {
        username: 'guest',
        first_name: 'Guest',
        last_name: 'User'
      },
      resources: [
        {
          type: 'dashboard',
          id: '1f48395c-cc6c-45a3-8f8b-3f722bbff31c'
        },
        {
          type: 'datasource',
          id: 2
        }
      ],
      rls_rules: [],
      roles: {
        Public: [
          // Basic permissions
          ['can_read', 'Superset'],
          ['can_read', 'Dashboard'],
          ['can_read', 'Chart'],
          ['can_read', 'Dataset'],
          ['can_read', 'Datasource'],
          
          // Specific datasource access
          ['datasource_access', '[main].(id:2)'],  // This is the format used in embedded dashboards
          
          // Database access
          ['database_access', '[main].(id:1)']
        ]
      },
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      aud: 'http://0.0.0.0:8080/',
      type: 'guest'
    };

    const guestToken = jwt.sign(payload, JWT_SECRET, {
      algorithm: 'HS256'
    });

    return res.json({ token: guestToken });
  } catch (error) {
    console.error('Error generating guest token:', error);
    res.status(500).json({ error: error.message });
  }
});

// Keep the test-token endpoint for debugging
app.get('/api/test-token', async (req, res) => {
  const testJwt = jwt.sign({
    user: {
      username: 'guest',
      first_name: 'Guest',
      last_name: 'User'
    },
    resources: [{
      type: 'dashboard',
      id: '1f48395c-cc6c-45a3-8f8b-3f722bbff31c'
    }],
    rls_rules: [],
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    aud: 'http://0.0.0.0:8080/',
    type: 'guest'
  }, JWT_SECRET, { algorithm: 'HS256' });
  
  console.log('Test token:', testJwt);
  
  // Get CSRF token first
  const csrfData = await getCSRFToken();
  if (!csrfData) {
    return res.status(500).json({ error: 'Failed to get CSRF token' });
  }
  
  // Test multiple endpoints with correct paths
  const results = await Promise.all([
    // Test the security/guest_token endpoint (this one works)
    testEndpoint(testJwt, '/api/v1/security/guest_token/', 'POST', csrfData),
    
    // Test the guest user roles endpoint
    testEndpoint(testJwt, '/api/v1/me/roles/', 'GET', csrfData),
    
    // Test the guest user info endpoint
    testEndpoint(testJwt, '/api/v1/me/', 'GET', csrfData)
  ]);
  
  res.json({ 
    token: testJwt,
    testResults: results,
    csrfToken: csrfData.token
  });
});

// Update testEndpoint to maintain session
async function testEndpoint(token, endpoint, method = 'GET', csrfData = null) {
  try {
    // Login as admin first
    const adminAuth = await loginAsAdmin();
    
    const headers = {
      'X-GuestToken': token,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-CSRFToken': adminAuth.csrf,
      'Cookie': adminAuth.cookie,
      'Referer': 'http://localhost:3000'
    };

    // Don't include Authorization header for guest_token endpoint
    if (!endpoint.includes('guest_token')) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const requestOptions = {
      method: method,
      headers: headers,
      credentials: 'include'
    };

    const response = await fetch(`http://localhost:8088${endpoint}`, requestOptions);
    
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = text;
    }

    return {
      endpoint,
      method,
      status: response.status,
      headers: Object.fromEntries(response.headers),
      data
    };
  } catch (error) {
    return {
      endpoint,
      method,
      error: error.message
    };
  }
}

app.listen(port, () => {
  console.log(`Token server listening at http://localhost:${port}`);
});