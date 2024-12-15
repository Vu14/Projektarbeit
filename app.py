# app.py
from flask import Flask, render_template, jsonify
import sqlite3
import os

app = Flask(__name__)

def get_db():
    conn = sqlite3.connect('airbnb.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/data/<city>/<period>')
def get_data(city, period):
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM listings 
            WHERE city = ? AND period = ?
        ''', (city, period))
        
        # Konvertiere SQL-Rows zu Dictionary
        columns = [column[0] for column in cursor.description]
        rows = cursor.fetchall()
        data = []
        for row in rows:
            data.append(dict(zip(columns, row)))
        
        conn.close()
        return jsonify(data)
    
    except Exception as e:
        print(f"Error in get_data: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)