import sqlite3
import pandas as pd
import os

def create_database():
    # Verbindung zur Datenbank herstellen
    conn = sqlite3.connect('airbnb.db')
    cursor = conn.cursor()

    # Tabelle erstellen
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS listings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        city TEXT NOT NULL,
        period TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        room_type TEXT,
        person_capacity INTEGER,
        realSum REAL,
        guest_satisfaction_overall REAL,
        cleanliness_rating REAL,
        dist REAL,
        metro_dist REAL,
        attr_index REAL,
        rest_index REAL
    )
    ''')

    # Index für schnellere Abfragen
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_city_period ON listings(city, period)')

    # Daten importieren
    cities = ['amsterdam', 'athens', 'barcelona', 'berlin', 
              'budapest', 'lisbon', 'london', 'paris', 
              'rome', 'vienna']
    periods = ['weekday', 'weekend']

    for city in cities:
        for period in periods:
            filename = f"{city}_{period}s.csv"
            filepath = f"data/{filename}"
            
            if os.path.exists(filepath):
                print(f"Importing {filename}...")
                # CSV einlesen und unnötige Spalten entfernen
                df = pd.read_csv(filepath)
                
                # Entferne die Unnamed Spalte falls vorhanden
                columns_to_drop = [col for col in df.columns if 'Unnamed' in col]
                if columns_to_drop:
                    df = df.drop(columns=columns_to_drop)

                # Füge city und period hinzu
                df['city'] = city
                df['period'] = period

                # Stelle sicher, dass nur die benötigten Spalten in der richtigen Reihenfolge vorliegen
                required_columns = [
                    'city', 'period', 'lat', 'lng', 'room_type', 
                    'person_capacity', 'realSum', 'guest_satisfaction_overall',
                    'cleanliness_rating', 'dist', 'metro_dist', 
                    'attr_index', 'rest_index'
                ]

                # Prüfe ob alle erforderlichen Spalten vorhanden sind
                for col in required_columns:
                    if col not in df.columns:
                        df[col] = None  # Fülle fehlende Spalten mit None

                # Wähle nur die benötigten Spalten in der richtigen Reihenfolge
                df = df[required_columns]

                # In die Datenbank schreiben
                try:
                    df.to_sql('listings', conn, if_exists='append', index=False)
                    print(f"Successfully imported {len(df)} rows from {filename}")
                except Exception as e:
                    print(f"Error importing {filename}: {str(e)}")
                    continue

    # Commit und Verbindung schließen
    conn.commit()
    conn.close()
    print("Database creation completed!")

if __name__ == "__main__":
    create_database()