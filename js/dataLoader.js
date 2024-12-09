async function loadData() {
    try {
        const cities = [
            'amsterdam', 'athens', 'barcelona', 'berlin', 
            'budapest', 'lisbon', 'london', 'paris', 
            'rome', 'vienna'
        ];
        
        const period = state.timePeriod;
        
        // Load data for all cities
        const datasets = await Promise.all(
            cities.map(async city => {
                const filename = `${city}_${period}s.csv`;
                const response = await fetch(`data/${filename}`);
                const text = await response.text();
                const data = d3.csvParse(text);
                // Add filename to each row
                return data.map(row => ({...row, _filename: filename}));
            })
        );
        
        // Combine all datasets
        const combinedData = datasets.flat();
        
        // Store in state
        state.currentData = combinedData;
        
        return combinedData;
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