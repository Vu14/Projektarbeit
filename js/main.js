// Main application initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        // Load initial data
        const data = await loadData();
        
        // Initialize visualizations
        initializeVisualizations(data);
        
        // Setup event listeners
        setupEventListeners();
        
    } catch (error) {
        console.error('Error initializing application:', error);
    }
}

function initializeVisualizations(data) {
    // Initialize each visualization
    createPriceVisualization(data);
    createGeoVisualization(data);
    createSatisfactionVisualization(data);
    createDistanceVisualization(data);
}

function setupEventListeners() {
    // Time period selection
    document.getElementById('timeSelect').addEventListener('change', async (e) => {
        const newData = await updateDataForTimePeriod(e.target.value);
        updateAllVisualizations(newData);
    });

    // City selection
    document.getElementById('citySelect').addEventListener('change', (e) => {
        const selectedCities = Array.from(e.target.selectedOptions).map(option => option.value);
        filterDataByCities(selectedCities);
    });

    // Price range
    document.getElementById('priceRange').addEventListener('input', (e) => {
        document.getElementById('priceValue').textContent = `${e.target.value}€`;
        filterDataByPrice(e.target.value);
    });
}

function updateAllVisualizations(data) {
    updatePriceVisualization(data);
    updateGeoVisualization(data);
    updateSatisfactionVisualization(data);
    updateDistanceVisualization(data);
}

// Global state management
const state = {
    currentData: null,
    selectedCities: [],
    priceRange: 500,
    timePeriod: 'weekday'
};