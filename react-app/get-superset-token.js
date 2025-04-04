const fetch = require('node-fetch');

async function getSupersetGuestToken() {
  try {
    console.log('Attempting to get admin access token...');
    
    // First, get an admin access token
    const authResponse = await fetch('http://localhost:8088/api/v1/security/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',  // Replace with your admin username
        password: 'admin',  // Replace with your admin password
        provider: 'db'      // This is the missing field
      })
    });
    
    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error('Failed to get admin token. Status:', authResponse.status);
      console.error('Response:', errorText);
      return null;
    }
    
    const authData = await authResponse.json();
    
    if (!authData.access_token) {
      console.error('No access token in response:', authData);
      return null;
    }
    
    const accessToken = authData.access_token;
    console.log('Got admin access token successfully');
    
    // Then, use the admin token to request a guest token
    console.log('Requesting guest token...');
    const guestTokenResponse = await fetch('http://localhost:8088/api/v1/security/guest_token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        resources: [{
          type: 'dashboard',
          id: '1f48395c-cc6c-45a3-8f8b-3f722bbff31c'
        }],
        rls: [],
        user: {
          username: 'guest',
          first_name: 'Guest',
          last_name: 'User'
        }
      })
    });
    
    if (!guestTokenResponse.ok) {
      const errorText = await guestTokenResponse.text();
      console.error('Failed to get guest token. Status:', guestTokenResponse.status);
      console.error('Response:', errorText);
      return null;
    }
    
    const guestTokenData = await guestTokenResponse.json();
    console.log('Guest token response:', guestTokenData);
    
    return guestTokenData;
  } catch (error) {
    console.error('Error getting guest token:', error);
    return null;
  }
}

getSupersetGuestToken(); 