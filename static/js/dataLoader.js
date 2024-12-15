async function loadData() {
    try {
        const selectedCity = state.selectedCity;
        const selectedPeriod = state.selectedPeriod;
        
        console.log(`Loading data for ${selectedCity} - ${selectedPeriod}`);
        
        // Lade Daten vom Flask-Backend
        const response = await fetch(`/api/data/${selectedCity}/${selectedPeriod}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
        }
        
        const data = await response.json();
        
        // Add filename property to each data point
        const processedData = data.map(d => ({
            ...d,
            _filename: `${selectedCity}_${selectedPeriod}`
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

// Optional: Funktion zum Laden der verfügbaren Städte
async function loadCities() {
    try {
        const response = await fetch('/api/cities');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const cities = await response.json();
        
        // Populate city select
        const citySelect = document.getElementById('citySelect');
        citySelect.innerHTML = cities
            .map(city => `<option value="${city}">${city.charAt(0).toUpperCase() + city.slice(1)}</option>`)
            .join('');
            
    } catch (error) {
        console.error('Error loading cities:', error);
    }
}
