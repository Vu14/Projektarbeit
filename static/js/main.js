// Global state to manage dashboard data and selections
let state = {
    currentData: null, // Holds the current dataset
    secondData: null, // Holds the second dataset
    selectedCity: 'berlin', // Default city
    selectedCity2: 'amsterdam', // Splitview default city
    selectedPeriod: 'weekday', // Default time period
    splitView: false, // Tracks if splitview is enabled
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

        const data2 = await loadData2(); // Fetch data
        state.secondData = data2; // Store data in state
        
        // Set initial values for dropdowns
        document.getElementById('citySelect').value = state.selectedCity;
        document.getElementById('citySelect2').value = state.selectedCity2;
        document.getElementById('periodSelect').value = state.selectedPeriod;

        // Initialize all visualizations
        if (state.splitView) {
            createPriceVisualization(data, "#priceViz");
            createPriceVisualization(data2, "#priceViz2");
            createGeoVisualization(data,"#geoViz");
            createGeoVisualization(data2,"#geoViz2");
            createSatisfactionVisualization(data,"#satisfactionViz");
            createSatisfactionVisualization(data2,"#satisfactionViz2");
            createDistancePriceVisualization(data,"#distanceViz"); 
            createDistancePriceVisualization(data2,"#distanceViz2"); 
            
        } else {
            createGeoVisualization(data, "#geoViz");
            createPriceVisualization(data, "#priceViz");
            createDistancePriceVisualization(data,"#distanceViz"); 
            createSatisfactionVisualization(data, "#satisfactionViz");
        }

        

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
        state.selectedCity2 = document.getElementById('citySelect2').value;
        state.selectedPeriod = document.getElementById('periodSelect').value;
        
        const newData = await loadData(); // Fetch updated data
        const newData2 = await loadData2(); // Fetch updated data
        
        // Update all visualizations with new data
        if (state.splitView) {
            updatePriceVisualization(newData, "#priceViz");
            updatePriceVisualization(newData2, "#priceViz2");
            updateGeoVisualization(newData, "#geoViz");
            updateGeoVisualization(newData2, "#geoViz2");
            updateSatisfactionVisualization(newData, "#satisfactionViz");
            updateSatisfactionVisualization(newData2, "#satisfactionViz2");
            updateDistancePriceVisualization(newData, "#distanceViz"); 
            updateDistancePriceVisualization(newData2, "#distanceViz2"); 

        } else {
            updateGeoVisualization(newData, "#geoViz");
            updatePriceVisualization(newData, "#priceViz");
            updateDistancePriceVisualization(newData, "#distanceViz"); 
            updateSatisfactionVisualization(newData, "#satisfactionViz");
        }

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
    // Show loading overlay
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.style.display = 'flex';

    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4'); // Create a PDF in DIN-A4 format
        const pageWidth = 210; // Page width in mm
        const pageHeight = 297; // Page height in mm
        const margin = 10; // Margin
        let yPosition = margin; // Starting position on the page

        // Add title and description
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        pdf.text('AirBnB European Cities Analysis', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 10;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(12);
        pdf.text('Analyse pricing and satisfaction patterns across major European cities', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 10;

        // Export charts as images
        const vizGrid = document.querySelector('.viz-grid');
        const vizContainers = vizGrid.querySelectorAll('.viz-container');

        for (const container of vizContainers) {
            // Convert chart to image using html2canvas
            const canvas = await html2canvas(container);
            const imgData = canvas.toDataURL('image/png');

            // Calculate image dimensions and aspect ratio
            const imgWidth = pageWidth - 2 * margin;
            const imgHeight = (canvas.height / canvas.width) * imgWidth;

            // Add a new page if there's not enough space
            if (yPosition + imgHeight > pageHeight - margin) {
                pdf.addPage();
                yPosition = margin;
            }

            // Add chart title
            const title = container.querySelector('.viz-title').textContent;
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(14);
            pdf.text(title, margin, yPosition + 5);
            yPosition += 10;

            // Add the chart image
            pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 10;
        }

        // Add footer note
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(10);
        pdf.text(
            'Landmark information sourced and summarized with the help of ChatGPT.',
            pageWidth / 2,
            pageHeight - margin,
            { align: 'center' }
        );

        // Save the PDF file
        pdf.save('AirBnB_Analysis.pdf');
    } catch (error) {
        console.error('Error during PDF export:', error);
        alert('An error occurred during the export. Please try again.');
    } finally {
        // Hide loading overlay
        loadingOverlay.style.display = 'none';
    }
}


function toggleSplitView() {
    const isChecked = document.getElementById('splitViewToggle').checked;
    state.splitView = isChecked;
    

    if (state.splitView) {
        document.getElementById('split-container1').style.display = 'block';
        document.getElementById('split-container2').style.display = 'block';
        document.getElementById('split-container3').style.display = 'block';
        document.getElementById('split-container4').style.display = 'block';
        document.getElementsByClassName('split-container').style.display = 'block';
        console.log("splitview enabled");
    } else {
        document.getElementById('split-container1').style.display = 'none';
        document.getElementById('split-container2').style.display = 'none';
        document.getElementById('split-container3').style.display = 'none';
        document.getElementById('split-container4').style.display = 'none';
        document.getElementsByClassName('split-container').style.display = 'none';
        console.log("splitview disabled");
    }

    updateAllVisualizations();
}






// Export state globally if needed for debugging or external modules
window.dashboardState = state;
