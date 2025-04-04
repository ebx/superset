import React, { useEffect, useRef } from 'react';
import { embedDashboard } from "@superset-ui/embedded-sdk";
import './ChartEditor.css';

function ChartEditor() {
  const containerRef = useRef(null);

  useEffect(() => {
    const embed = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/guest-token');
        const data = await response.json();
        
        console.log('Attempting to embed chart dashboard...');

        await embedDashboard({
          id: 'your-new-dashboard-id',
          supersetDomain: 'http://localhost:8088',
          mountPoint: containerRef.current,
          fetchGuestToken: () => data.token,
          dashboardUiConfig: {
            hideTitle: false,
            hideTab: false,
            hideChartControls: false,
            filters: {
              expanded: true
            }
          }
        });
        
        console.log('Chart dashboard embedded successfully');
      } catch (error) {
        console.error('Error embedding chart dashboard:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
    };

    embed();
  }, []);

  return (
    <div ref={containerRef} className="chart-editor-container" style={{ height: '100vh' }} />
  );
}

export default ChartEditor; 