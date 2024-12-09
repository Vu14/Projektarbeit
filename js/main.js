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