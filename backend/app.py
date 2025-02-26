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

# @app.get("/teams/{team_abbr}/{player_id}")
# def get_player_data(team_abbr: str, player_id: str):
#     """
#     Retrieve a player's fit data from the appropriate team fit endpoint and then
#     their detailed data from the corresponding CSV file.
#     """
#     # Convert team abbreviation to full name
#     team_name = TEAM_ABBR_TO_NAME.get(team_abbr.upper())
#     if not team_name:
#         raise HTTPException(status_code=404, detail=f"Unknown team abbreviation: {team_abbr}")

#     # Dictionary mapping positions to their fit function and CSV filename.
#     # Adjust the key names if your fit records use a different key for the player id.
#     position_endpoints = {
#         "QB": {"fit_func": get_qb_fits_for_team, "csv": "qb_data.csv"},
#         "RB": {"fit_func": get_rb_fits_for_team, "csv": "rb_data.csv"},
#         "WR": {"fit_func": get_wr_fits_for_team, "csv": "wr_data.csv"},
#     }

#     fit_record = None
#     position_found = None

#     # Try each position fit endpoint to locate the player's fit record
#     for position, info in position_endpoints.items():
#         fits_df = info["fit_func"](team_name)
#         if fits_df is None or fits_df.empty:
#             continue
#         # Convert the DataFrame to a list of dictionaries
#         fits_list = fits_df.to_dict(orient="records")
#         for record in fits_list:
#             # Compare the player_id (assumes the key is "player_id")
#             if str(record.get("player_id", "")).strip() == player_id.strip():
#                 fit_record = record
#                 position_found = position
#                 break
#         if fit_record:
#             break

#     if not fit_record:
#         raise HTTPException(
#             status_code=404, 
#             detail=f"No fit data found for player id '{player_id}' on team '{team_abbr}'"
#         )

#     # Now load the detailed player data from the corresponding CSV file
#     data_folder = os.path.join(os.path.dirname(__file__), 'processed_data')
#     csv_filename = position_endpoints[position_found]["csv"]
#     csv_file_path = os.path.join(data_folder, csv_filename)
#     player_csv_data = None

#     try:
#         with open(csv_file_path, newline='') as csvfile:
#             reader = csv.DictReader(csvfile)
#             for row in reader:
#                 if str(row.get("player_id", "")).strip() == player_id.strip():
#                     player_csv_data = row
#                     break
#     except FileNotFoundError:
#         raise HTTPException(
#             status_code=404, 
#             detail=f"CSV file {csv_filename} not found in processed_data folder"
#         )

#     if not player_csv_data:
#         raise HTTPException(
#             status_code=404,
#             detail=f"Player data not found for player id '{player_id}' in {csv_filename}"
#         )

#     # Combine the fit record and the CSV player data into a single response
#     return {
#         "fit": fit_record,
#         "player_data": player_csv_data
#     }


