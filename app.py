from flask import Flask, render_template, jsonify
import sqlite3
import os

app = Flask(__name__)

# Function to establish a connection to the SQLite database
def get_db():
    conn = sqlite3.connect('airbnb.db')  # Connect to the database file
    conn.row_factory = sqlite3.Row  # Enable row factory for dictionary-like row access
    return conn

# Route to serve the main dashboard page
@app.route('/')
def index():
    return render_template('index.html')  # Render the main HTML template

# API route to fetch data based on city and period
@app.route('/api/data/<city>/<period>')
def get_data(city, period):
    try:
        conn = get_db()  # Get database connection
        cursor = conn.cursor()
        
        # SQL query to select data based on city and period
        cursor.execute('''
            SELECT * FROM listings 
            WHERE city = ? AND period = ?
        ''', (city, period))
        
        # Convert SQL rows to a list of dictionaries
        columns = [column[0] for column in cursor.description]  # Column names
        rows = cursor.fetchall()
        data = [dict(zip(columns, row)) for row in rows]  # Transform rows into dictionaries
        
        conn.close()  # Close the database connection
        return jsonify(data)  # Return the data as a JSON response
    
    except Exception as e:
        # Handle errors and return a meaningful JSON response
        print(f"Error in get_data: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Main entry point of the application
if __name__ == '__main__':
    app.run(debug=True)  # Run the app in debug mode
