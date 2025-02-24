from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import csv
import os
import uvicorn

# Import the existing get_fits functions
from scripts.qb_fit_app import get_qb_fits_for_team
from scripts.rb_fit_app import get_rb_fits_for_team
from scripts.wr_fit_app import get_wr_fits_for_team

# team dict
TEAM_ABBR_TO_NAME = {
    "ARI": "Arizona Cardinals",
    "ATL": "Atlanta Falcons",
    "BAL": "Baltimore Ravens",
    "BUF": "Buffalo Bills",
    "CAR": "Carolina Panthers",
    "CHI": "Chicago Bears",
    "CIN": "Cincinnati Bengals",
    "CLE": "Cleveland Browns",
    "DAL": "Dallas Cowboys",
    "DEN": "Denver Broncos",
    "DET": "Detroit Lions",
    "GB": "Green Bay Packers",
    "HOU": "Houston Texans",
    "IND": "Indianapolis Colts",
    "JAX": "Jacksonville Jaguars",
    "KC": "Kansas City Chiefs",
    "LV": "Las Vegas Raiders",
    "LAC": "Los Angeles Chargers",
    "LA": "Los Angeles Rams",
    "MIA": "Miami Dolphins",
    "MIN": "Minnesota Vikings",
    "NE": "New England Patriots",
    "NO": "New Orleans Saints",
    "NYG": "New York Giants",
    "NYJ": "New York Jets",
    "PHI": "Philadelphia Eagles",
    "PIT": "Pittsburgh Steelers",
    "SF": "San Francisco 49ers",
    "SEA": "Seattle Seahawks",
    "TB": "Tampa Bay Buccaneers",
    "TEN": "Tennessee Titans",
    "WAS": "Washington Commanders"
}


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

@app.get("/teams/{team_abbr}/qbfits")
def qb_fits_for_team_endpoint(team_abbr: str):
    """
    Return QB fit data for the given team abbreviation.
    """
    # Convert the abbreviation to the full team name
    team_name = TEAM_ABBR_TO_NAME.get(team_abbr.upper(), None)
    if not team_name:
        raise HTTPException(status_code=404, detail=f"Unknown team abbreviation: {team_abbr}")

    # Now pass the full team name to your existing function
    fits_df = get_qb_fits_for_team(team_name)
    if fits_df is None or fits_df.empty:
        raise HTTPException(status_code=404, detail=f"No QB fits found for team: {team_abbr}")

    # Return JSON
    return fits_df.to_dict(orient="records")

@app.get("/teams/{team_abbr}/rbfits")
def rb_fits_for_team_endpoint(team_abbr: str):
    """
    Return QB fit data for the given team abbreviation.
    """
    # Convert the abbreviation to the full team name
    team_name = TEAM_ABBR_TO_NAME.get(team_abbr.upper(), None)
    if not team_name:
        raise HTTPException(status_code=404, detail=f"Unknown team abbreviation: {team_abbr}")

    # Now pass the full team name to your existing function
    fits_df = get_rb_fits_for_team(team_name)
    if fits_df is None or fits_df.empty:
        raise HTTPException(status_code=404, detail=f"No QB fits found for team: {team_abbr}")

    # Return JSON
    return fits_df.to_dict(orient="records")

@app.get("/teams/{team_abbr}/wrfits")
def wr_fits_for_team_endpoint(team_abbr: str):
    """
    Return QB fit data for the given team abbreviation.
    """
    # Convert the abbreviation to the full team name
    team_name = TEAM_ABBR_TO_NAME.get(team_abbr.upper(), None)
    if not team_name:
        raise HTTPException(status_code=404, detail=f"Unknown team abbreviation: {team_abbr}")

    # Now pass the full team name to your existing function
    fits_df = get_wr_fits_for_team(team_name)
    if fits_df is None or fits_df.empty:
        raise HTTPException(status_code=404, detail=f"No QB fits found for team: {team_abbr}")

    # Return JSON
    return fits_df.to_dict(orient="records")

