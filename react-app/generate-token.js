const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Same secret key as in superset_config.py
const JWT_SECRET = 'i4XAjRc19/yr6Kn/RfPE5U8kWL9y+RoWFsGhRZC3+I+2otcwTuG5iDnP';

// Create a token with a longer expiration (1 week)
const token = jwt.sign({
  // Standard JWT claims
  iss: 'superset',
  sub: 'guest',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 1 week
  aud: 'embedded',
  
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

console.log('Generated token:', token);

// Create a new SupersetDashboard component with the token
const componentContent = `import React, { useState } from 'react';

const SupersetDashboard = ({ dashboardId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Token generated on ${new Date().toISOString()}, expires in 1 week
  const token = "${token}";
  
  // Dashboard URL with the token
  const dashboardUrl = \`http://localhost:8088/superset/dashboard/13/?standalone=true&guest_token=\${token}\`;
  
  // Add error handling for the iframe
  const handleIframeError = () => {
    setError('Failed to load dashboard');
    setLoading(false);
  };
  
  return (
    <div>
      <h2>Superset Dashboard</h2>
      {loading && <p>Loading dashboard...</p>}
      {error && <p className="error">{error}</p>}
      
      <iframe
        title="Superset Dashboard"
        src={dashboardUrl}
        style={{
          width: '100%',
          height: '800px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          overflow: 'hidden',
          display: error ? 'none' : 'block'
        }}
        onLoad={() => setLoading(false)}
        onError={handleIframeError}
      />
      
      {error && (
        <div className="error-container">
          <p>Unable to load the dashboard. Please try:</p>
          <ul>
            <li>Checking if Superset is running</li>
            <li>Verifying that you're logged into Superset</li>
            <li>Confirming that the dashboard ID is correct</li>
          </ul>
          <a 
            href={dashboardUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="dashboard-link"
          >
            Open Dashboard in New Window
          </a>
        </div>
      )}
    </div>
  );
};

export default SupersetDashboard;
`;

// Write the component to a file
fs.writeFileSync(
  path.join(__dirname, 'src', 'components', 'SupersetDashboard.js'),
  componentContent
);

console.log('Updated SupersetDashboard.js with the new token'); 