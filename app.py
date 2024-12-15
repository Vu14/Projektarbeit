from flask import Flask, render_template, jsonify, send_from_directory
import pandas as pd
import os

app = Flask(__name__)

# Konfiguration
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')  # Absoluter Pfad
STATIC_DIR = 'static'
CITIES = [
    'amsterdam', 'athens', 'barcelona', 'berlin', 
    'budapest', 'lisbon', 'london', 'paris', 
    'rome', 'vienna'
]
PERIODS = ['weekday', 'weekend']

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/data/<city>/<period>')
def get_data(city, period):
    try:
        if city not in CITIES or period not in PERIODS:
            return jsonify({'error': 'Invalid city or period'}), 400

        # Konstruiere den Dateinamen
        filename = f"{city}_{period}s.csv"  # Beachte das 's' am Ende
        filepath = os.path.join(DATA_DIR, filename)
        
        # Überprüfe ob die Datei existiert
        if not os.path.exists(filepath):
            print(f"File not found: {filepath}")  # Debug-Ausgabe
            return jsonify({'error': f'File not found: {filename}'}), 404
        
        # Lade die CSV-Datei
        df = pd.read_csv(filepath)
        
        # Konvertiere zu JSON
        return jsonify(df.to_dict(orient='records'))
    
    except Exception as e:
        app.logger.error(f"Error loading data: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/static/js/<path:filename>')
def serve_js(filename):
    return send_from_directory(os.path.join(STATIC_DIR, 'js'), filename)

@app.route('/data/geojson/<path:filename>')
def serve_geojson(filename):
    return send_from_directory(os.path.join(DATA_DIR, 'geojson'), filename)

if __name__ == '__main__':
    # Überprüfe ob die Datenverzeichnisse existieren
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
        print(f"Created data directory at: {DATA_DIR}")
    
    if not os.path.exists(os.path.join(DATA_DIR, 'geojson')):
        os.makedirs(os.path.join(DATA_DIR, 'geojson'))
        print(f"Created geojson directory at: {os.path.join(DATA_DIR, 'geojson')}")
    
    print(f"Using data directory: {DATA_DIR}")
    app.run(debug=True, port=5000)