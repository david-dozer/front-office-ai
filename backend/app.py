from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import csv
import os

app = FastAPI()

# Enable CORS for all routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to CSV within the data folder
CSV_FILE = os.path.join(os.path.dirname(__file__), 'processed_data', 'team_seasonal_stats.csv')

@app.get("/teams")
def get_teams():
    data = []
    try:
        with open(CSV_FILE, newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                data.append(row)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="CSV file not found")
    return data

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000, reload=True)
