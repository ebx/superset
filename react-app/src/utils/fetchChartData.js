async function fetchChartData(chartId, guestToken) {
  try {
    // First get the chart form data
    const formDataResponse = await fetch(
      `http://localhost:8088/api/v1/chart/${chartId}`,
      {
        headers: {
          'Authorization': `Bearer ${guestToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!formDataResponse.ok) {
      throw new Error(`Failed to fetch chart form data: ${formDataResponse.status}`);
    }

    const chartInfo = await formDataResponse.json();

    // Then get the actual data using the form_data
    const dataResponse = await fetch(
      `http://localhost:8088/api/v1/chart/data`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${guestToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          form_data: chartInfo.result.form_data,
          force: false
        })
      }
    );

    if (!dataResponse.ok) {
      throw new Error(`Failed to fetch chart data: ${dataResponse.status}`);
    }

    const data = await dataResponse.json();
    return data;
  } catch (error) {
    console.error('Error fetching chart data:', error);
    throw error;
  }
}

// Example usage:
async function example() {
  try {
    // Get guest token first
    const tokenResponse = await fetch('http://localhost:5000/api/guest-token');
    const { token } = await tokenResponse.json();

    // Then fetch chart data
    const chartData = await fetchChartData('4de07795-1cad-41ab-9b55-636089b09324', token);
    console.log('Chart data:', chartData);

    // The data will include:
    // - chartData.result[0].data - The actual data points
    // - chartData.result[0].colnames - Column names
    // - chartData.result[0].coltypes - Column types
  } catch (error) {
    console.error('Error:', error);
  }
} 