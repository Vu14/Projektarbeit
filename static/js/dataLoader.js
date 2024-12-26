/**
 * Function to load data based on the selected city and period.
 */
async function loadData() {
    try {
        const selectedCity = state.selectedCity;
        const selectedPeriod = state.selectedPeriod;

        // Fetch data from the Flask backend
        const response = await fetch(`/api/data/${selectedCity}/${selectedPeriod}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Parse the JSON response
        const data = await response.json();
        
        // Process the data: Add a filename property and convert numeric fields
        const processedData = data.map(d => ({
            ...d,
            _filename: `${selectedCity}_${selectedPeriod}s`, // Filename identifier for debugging
            lat: parseFloat(d.lat), // Ensure latitude is a float
            lng: parseFloat(d.lng), // Ensure longitude is a float
            realSum: parseFloat(d.realSum) // Ensure price is a float
        }));

        // Update application state with the loaded data
        state.currentData = processedData;
        
        return processedData;
        
    } catch (error) {
        console.error('Error loading data:', error);
        throw error;
    }
}
