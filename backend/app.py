from flask import Flask, jsonify
from flask_cors import CORS
import csv
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Path to CSV within the data folder
CSV_FILE = os.path.join(os.path.dirname(__file__), 'processed_data', 'team_seasonal_stats.csv')

@app.route('/teams', methods=['GET'])
def get_teams():
    data = []
    try:
        with open(CSV_FILE, newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                data.append(row)
    except FileNotFoundError:
        return jsonify({"error": "CSV file not found"}), 404

    return jsonify(data), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

