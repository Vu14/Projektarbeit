import sqlite3
import pandas as pd
import os

def create_database():
    """
    Function to create a SQLite database for Airbnb data and populate it from CSV files.
    """
    # Connect to the SQLite database (or create it if it doesn't exist)
    conn = sqlite3.connect('airbnb.db')
    cursor = conn.cursor()

    # Create the `listings` table if it doesn't already exist
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

    # Create an index on `city` and `period` for faster queries
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_city_period ON listings(city, period)')

    # List of cities and periods to process
    cities = ['amsterdam', 'athens', 'barcelona', 'berlin', 
              'budapest', 'lisbon', 'london', 'paris', 
              'rome', 'vienna']
    periods = ['weekday', 'weekend']

    # Import data from CSV files
    for city in cities:
        for period in periods:
            filename = f"{city}_{period}s.csv"
            filepath = f"data/{filename}"
            
            if os.path.exists(filepath):
                print(f"Importing {filename}...")

                # Read the CSV file
                df = pd.read_csv(filepath)

                # Drop unnecessary "Unnamed" columns if they exist
                columns_to_drop = [col for col in df.columns if 'Unnamed' in col]
                if columns_to_drop:
                    df = df.drop(columns=columns_to_drop)

                # Add `city` and `period` columns to the dataframe
                df['city'] = city
                df['period'] = period

                # Ensure the required columns are present and in the correct order
                required_columns = [
                    'city', 'period', 'lat', 'lng', 'room_type', 
                    'person_capacity', 'realSum', 'guest_satisfaction_overall',
                    'cleanliness_rating', 'dist', 'metro_dist', 
                    'attr_index', 'rest_index'
                ]

                # Fill missing columns with `None` if they are not present in the CSV
                for col in required_columns:
                    if col not in df.columns:
                        df[col] = None

                # Reorder the dataframe to match the required column order
                df = df[required_columns]

                # Write the data to the database
                try:
                    df.to_sql('listings', conn, if_exists='append', index=False)
                    print(f"Successfully imported {len(df)} rows from {filename}")
                except Exception as e:
                    print(f"Error importing {filename}: {str(e)}")
                    continue

    # Commit the transaction and close the database connection
    conn.commit()
    conn.close()
    print("Database creation completed!")

if __name__ == "__main__":
    create_database()
