async function loadData() {
    try {
        const cities = [
            'amsterdam', 'athens', 'barcelona', 'berlin', 
            'budapest', 'lisbon', 'london', 'paris', 
            'rome', 'vienna'
        ];
        
        // Mögliche Zeiträume, hier nehmen wir an, dass es 'weekday' und 'weekend' gibt, aber es können auch weitere existieren
        const periods = ['weekday', 'weekend']; // Falls du weitere Perioden hast, kannst du sie hier hinzufügen
        
        // Lade Daten für alle Städte und alle Perioden
        const datasets = await Promise.all(
            cities.map(async city => {
                // Lade alle Perioden für jede Stadt
                const cityData = await Promise.all(
                    periods.map(async period => {
                        const filename = `${city}_${period}s.csv`; // Beachte das S für Wochenenddateien
                        const response = await fetch(`data/${filename}`);
                        
                        // Wenn die Datei nicht existiert, überspringe sie
                        if (!response.ok) {
                            console.warn(`Datei für ${city} im Zeitraum ${period} konnte nicht geladen werden.`);
                            return []; // Rückgabe eines leeren Arrays, wenn die Datei nicht existiert
                        }

                        const text = await response.text();
                        const data = d3.csvParse(text);

                        // Füge den Dateinamen zu jedem Datensatz hinzu
                        return data.map(row => ({...row, _filename: filename}));
                    })
                );

                // Kombiniere die Daten aus allen Perioden für diese Stadt
                return cityData.flat(); // `flat()` kombiniert alle Perioden für eine Stadt
            })
        );
        
        // Kombiniere alle Datensätze aus allen Städten
        const combinedData = datasets.flat();
        
        // Speichere die kombinierten Daten im Zustand
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