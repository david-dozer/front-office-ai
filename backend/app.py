from flask import Flask, jsonify
import csv
import os

app = Flask(__name__)

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
    app.run(debug=True)
