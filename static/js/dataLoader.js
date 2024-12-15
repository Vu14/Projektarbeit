// dataLoader.js
async function loadData() {
    try {
        const selectedCity = state.selectedCity;
        const selectedPeriod = state.selectedPeriod;
        
        // Lade Daten vom Flask-Backend
        const response = await fetch(`/api/data/${selectedCity}/${selectedPeriod}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Loaded data:', data.length, 'entries');
        console.log('Sample entry:', data[0]);  // Debug-Ausgabe
        
        // Add filename property to each data point
        const processedData = data.map(d => ({
            ...d,
            _filename: `${selectedCity}_${selectedPeriod}s`,
            lat: parseFloat(d.lat), 
            lng: parseFloat(d.lng),
            realSum: parseFloat(d.realSum)  
        }));

        // Update state
        state.currentData = processedData;
        
        return processedData;
        
    } catch (error) {
        console.error('Error loading data:', error);
        throw error;
    }
}

async function updateDataForTimePeriod(period) {
    state.timePeriod = period;
    return await loadData();
}

function filterDataByCities(cities) {
    state.selectedCities = cities;
    const filteredData = state.currentData.filter(d => 
        cities.includes(d.city.toLowerCase())
    );
    updateAllVisualizations(filteredData);
}

function filterDataByPrice(maxPrice) {
    state.priceRange = maxPrice;
    const filteredData = state.currentData.filter(d => 
        d.realSum <= maxPrice
    );
    updateAllVisualizations(filteredData);
}


