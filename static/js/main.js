// Global state to manage dashboard data and selections
let state = {
    currentData: null,
    selectedCity: 'berlin',
    selectedPeriod: 'weekday',
    isLoading: true
};

// Initialize the dashboard when page loads
document.addEventListener('DOMContentLoaded', initializeDashboard);

async function initializeDashboard() {
    try {
        // Show loading state
        state.isLoading = true;
        updateLoadingState(true);

        // Load initial data
        const data = await loadData();
        state.currentData = data;
        
        // Set initial select values
        document.getElementById('citySelect').value = state.selectedCity;
        document.getElementById('periodSelect').value = state.selectedPeriod;

        // Filter initial data
        const filteredData = filterData();
        
        // Initialize all visualizations
        createGeoVisualization(filteredData);
        //createPriceVisualization(filteredData);
        //createSatisfactionVisualization(filteredData);

        // Hide loading state
        state.isLoading = false;
        updateLoadingState(false);

    } catch (error) {
        console.error('Error initializing dashboard:', error);
        handleError('Failed to initialize dashboard');
    }
}

// Update all visualizations when selections change
async function updateAllVisualizations() {
    try {
        // Update state with new selections
        state.selectedCity = document.getElementById('citySelect').value;
        state.selectedPeriod = document.getElementById('periodSelect').value;
        
        // Load new data
        const newData = await loadData();
        
        // Update visualizations with new data
        updateGeoVisualization(newData, state.selectedCity);
        updatePriceVisualization(newData);
        updateSatisfactionVisualization(newData);
    } catch (error) {
        console.error('Error updating visualizations:', error);
    }
}

// Filter data based on current state
function filterData() {
    return state.currentData.filter(d => 
        d._filename && 
        d._filename.includes(`${state.selectedCity}_${state.selectedPeriod}`)
    );
}

// Update loading state for visualizations
function updateLoadingState(isLoading) {
    const loadingClass = 'loading';
    const vizContainers = ['priceViz', 'geoViz', 'satisfactionViz'];
    
    vizContainers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            if (isLoading) {
                container.classList.add(loadingClass);
            } else {
                container.classList.remove(loadingClass);
            }
        }
    });
}

// Handle errors
function handleError(message) {
    // You can customize this based on how you want to show errors
    console.error(message);
    // Could add UI error handling here
}

// Add window resize handler
window.addEventListener('resize', debounce(() => {
    if (!state.isLoading) {
        updateAllVisualizations();
    }
}, 250));

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export state for other modules if needed
window.dashboardState = state;