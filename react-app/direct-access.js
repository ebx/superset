const jwt = require('jsonwebtoken');

// Same secret key as in superset_config.py
const JWT_SECRET = 'i4XAjRc19/yr6Kn/RfPE5U8kWL9y+RoWFsGhRZC3+I+2otcwTuG5iDnP';

// Create a token
const token = jwt.sign({
  iss: 'superset',
  sub: 'guest',
  aud: 'embedded',
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
  expiresIn: '1h',
  algorithm: 'HS256'
});

console.log('Generated token:', token);
console.log('Direct URL:');
console.log(`http://localhost:8088/superset/dashboard/1f48395c-cc6c-45a3-8f8b-3f722bbff31c/?standalone=true&guest_token=${token}`);
console.log('\nEmbedded URL:');
console.log(`http://localhost:8088/embedded/1f48395c-cc6c-45a3-8f8b-3f722bbff31c/?guest_token=${token}`); 