async function fetchDatasetData(datasetId, guestToken) {
  try {
    const response = await fetch(
      `http://localhost:8088/api/v1/dataset/${datasetId}/data`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${guestToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          force: false,
          queries: [{
            columns: ['*'],  // Get all columns
            filters: [],     // No filters
            orderby: [],     // No sorting
            row_limit: 1000  // Limit results
          }]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch dataset data: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching dataset data:', error);
    throw error;
  }
} 