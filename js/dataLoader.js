async function loadData() {
    try {
        const cities = [
            'amsterdam', 'athens', 'barcelona', 'berlin', 
            'budapest', 'lisbon', 'london', 'paris', 
            'rome', 'vienna'
        ];
        
        const period = state.timePeriod; // 'weekday' or 'weekend'
        
        // Load data for all cities
        const datasets = await Promise.all(
            cities.map(city => 
                d3.csv(`data/${city}_${period}s.csv`)
            )
        );
        
        // Combine and process datasets
        const combinedData = datasets.flat().map(d => ({
            ...d,
            realSum: +d.realSum,
            person_capacity: +d.person_capacity,
            cleanliness_rating: +d.cleanliness_rating,
            guest_satisfaction_overall: +d.guest_satisfaction_overall,
            bedrooms: +d.bedrooms,
            dist: +d.dist,
            metro_dist: +d.metro_dist,
            lng: +d.lng,
            lat: +d.lat
        }));

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