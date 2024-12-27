// Global state to manage dashboard data and selections
let state = {
    currentData: null, // Holds the current dataset
    selectedCity: 'berlin', // Default city
    selectedPeriod: 'weekday', // Default time period
    isLoading: true // Tracks the loading state
};

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', initializeDashboard);

/**
 * Function to initialize the dashboard.
 * Loads data, sets default selections, and initializes visualizations.
 */
async function initializeDashboard() {
    try {
        state.isLoading = true; // Set loading state

        const data = await loadData(); // Fetch data
        state.currentData = data; // Store data in state
        
        // Set initial values for dropdowns
        document.getElementById('citySelect').value = state.selectedCity;
        document.getElementById('periodSelect').value = state.selectedPeriod;

        // Initialize all visualizations
        createGeoVisualization(data);
        createPriceVisualization(data);
        createDistancePriceVisualization(data); 
        createSatisfactionVisualization(data);

        state.isLoading = false; // Update loading state

    } catch (error) {
        handleError('Error initializing dashboard: ' + error.message);
    }
}

/**
 * Function to update all visualizations when selections change.
 */
async function updateAllVisualizations() {
    try {
        state.selectedCity = document.getElementById('citySelect').value;
        state.selectedPeriod = document.getElementById('periodSelect').value;
        
        const newData = await loadData(); // Fetch updated data
        
        // Update all visualizations with new data
        updateGeoVisualization(newData, state.selectedCity);
        updatePriceVisualization(newData);
        updateDistancePriceVisualization(filterData()); // Filtered data for distance visualization
        updateSatisfactionVisualization(newData);

    } catch (error) {
        handleError('Error updating visualizations: ' + error.message);
    }
}

/**
 * Function to filter the current data based on the selected city and period.
 * @returns {Array} Filtered dataset
 */
function filterData() {
    return state.currentData.filter(d => 
        d._filename && 
        d._filename.includes(`${state.selectedCity}_${state.selectedPeriod}`)
    );
}

/**
 * Function to handle errors.
 * Logs the error and can be extended to display UI feedback.
 * @param {string} message - The error message to handle.
 */
function handleError(message) {
    console.error(message);
    // Add UI error handling logic here if needed
}

/**
 * Adds a resize event handler to update visualizations on window resize.
 * Uses debounce to optimize performance.
 */
window.addEventListener('resize', debounce(() => {
    if (!state.isLoading) {
        updateAllVisualizations();
    }
}, 250));

/**
 * Utility function to debounce function execution.
 * @param {Function} func - The function to debounce.
 * @param {number} wait - The debounce delay in milliseconds.
 * @returns {Function} Debounced function.
 */
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
async function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4'); // DIN A4 in Portrait-Modus

    const pageWidth = 210; // A4 Breite in mm
    const pageHeight = 297; // A4 Höhe in mm
    const margin = 10; // Ränder in mm
    let yPosition = margin; // Startposition auf der Seite

    // Titel hinzufügen
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text('Dashboard Export', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10; // Abstand nach Titel

    // HTML-Elemente auswählen und in Bilder umwandeln
    const charts = document.querySelectorAll('.chart-container'); // Passe den Selektor an deine Diagramme an

    for (let i = 0; i < charts.length; i++) {
        const chart = charts[i];

        // Diagramm als Bild umwandeln
        const canvas = await html2canvas(chart); // Verwende html2canvas für Screenshot
        const imgData = canvas.toDataURL('image/png');

        // Verhältnis berechnen
        const imgWidth = pageWidth - 2 * margin;
        const imgHeight = (canvas.height / canvas.width) * imgWidth;

        // Bild hinzufügen
        if (yPosition + imgHeight > pageHeight - margin) {
            pdf.addPage(); // Neue Seite hinzufügen, wenn Platz nicht reicht
            yPosition = margin;
        }

        pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10; // Abstand nach dem Bild
    }

    // PDF herunterladen
    pdf.save('dashboard-export.pdf');
}

// Export state globally if needed for debugging or external modules
window.dashboardState = state;
