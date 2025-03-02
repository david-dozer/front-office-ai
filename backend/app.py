from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import csv
import os

# Import the existing get_fits functions
from scripts.qb_fit_app import get_qb_fits_for_team
from scripts.rb_fit_app import get_rb_fits_for_team
from scripts.wr_fit_app import get_wr_fits_for_team

# --- Directory Setup ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))    # path to backend/
DATA_DIR = os.path.join(BASE_DIR, "processed_data")      # path to backend/processed_data

# This is for your /teams endpoint that reads team_seasonal_stats.csv
TEAM_SEASONAL_FILE = os.path.join(DATA_DIR, "team_seasonal_stats.csv")

# --- Team Abbreviations ---
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

# --- Position → fits function ---
FITS_FUNCTIONS = {
    "QB": get_qb_fits_for_team,
    "RB": get_rb_fits_for_team,
    "WR": get_wr_fits_for_team,
    # Add more if needed (TE, etc.)
}

# --- Position → CSV filename ---
POSITION_DATA_FILES = {
    "QB": "fa_qbs.csv",
    "RB": "fa_rbs.csv",
    "WR": "fa_wrs.csv",
    # Add more if needed
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

# --- 1. Endpoint: /teams ---
@app.get("/teams")
def get_teams():
    """
    Reads all rows from team_seasonal_stats.csv
    and returns them as a list of dicts.
    """
    data = []
    try:
        with open(TEAM_SEASONAL_FILE, newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                data.append(row)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="team_seasonal_stats.csv not found")
    return data

# --- 2. Endpoint: /teams/{team_abbr}/qbfits ---
@app.get("/teams/{team_abbr}/qbfits")
def qb_fits_for_team_endpoint(team_abbr: str):
    """
    Return QB fit data for the given team abbreviation.
    """
    team_name = TEAM_ABBR_TO_NAME.get(team_abbr.upper())
    if not team_name:
        raise HTTPException(status_code=404, detail=f"Unknown team abbreviation: {team_abbr}")

    fits_df = get_qb_fits_for_team(team_name)
    if fits_df is None or fits_df.empty:
        raise HTTPException(status_code=404, detail=f"No QB fits found for team: {team_abbr}")

    return fits_df.to_dict(orient="records")

# --- 3. Endpoint: /teams/{team_abbr}/rbfits ---
@app.get("/teams/{team_abbr}/rbfits")
def rb_fits_for_team_endpoint(team_abbr: str):
    """
    Return RB fit data for the given team abbreviation.
    """
    team_name = TEAM_ABBR_TO_NAME.get(team_abbr.upper())
    if not team_name:
        raise HTTPException(status_code=404, detail=f"Unknown team abbreviation: {team_abbr}")

    fits_df = get_rb_fits_for_team(team_name)
    if fits_df is None or fits_df.empty:
        raise HTTPException(status_code=404, detail=f"No RB fits found for team: {team_abbr}")

    return fits_df.to_dict(orient="records")

# --- 4. Endpoint: /teams/{team_abbr}/wrfits ---
@app.get("/teams/{team_abbr}/wrfits")
def wr_fits_for_team_endpoint(team_abbr: str):
    """
    Return WR fit data for the given team abbreviation.
    """
    team_name = TEAM_ABBR_TO_NAME.get(team_abbr.upper())
    if not team_name:
        raise HTTPException(status_code=404, detail=f"Unknown team abbreviation: {team_abbr}")

    fits_df = get_wr_fits_for_team(team_name)
    if fits_df is None or fits_df.empty:
        raise HTTPException(status_code=404, detail=f"No WR fits found for team: {team_abbr}")

    return fits_df.to_dict(orient="records")

# --- Helper: read_csv_rows for a given position ---
def read_csv_rows(position: str):
    """
    Reads rows from the corresponding {position}_data.csv file
    and returns a list of dicts. Adjust if your CSV is named differently.
    """
    csv_filename = POSITION_DATA_FILES[position]
    csv_path = os.path.join(DATA_DIR, csv_filename)
    try:
        with open(csv_path, newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            rows = list(reader)
        return rows
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail=f"CSV file '{csv_filename}' not found in processed_data folder"
        )

# --- Helper: optional binary search by player name ---
def binary_search_by_name(rows, name_key: str, target_name: str):
    """
    Assume 'rows' is sorted ascending by 'name_key'.
    Perform a binary search, case-insensitive.
    Returns the matching row or None if not found.
    """
    left, right = 0, len(rows) - 1
    target_lower = target_name.lower()

    while left <= right:
        mid = (left + right) // 2
        mid_name = rows[mid][name_key].strip().lower()

        if mid_name == target_lower:
            return rows[mid]
        elif mid_name < target_lower:
            left = mid + 1
        else:
            right = mid - 1

    return None

# --- 5. Universal endpoint: /teams/{team_abbr}/{position}info/{player_name} ---
@app.get("/teams/{team_abbr}/{position}info/{player_name}")
def get_player_info(team_abbr: str, position: str, player_name: str):
    """
    Retrieve a given player's info (QB/RB/WR) for a team:
      1. Convert team_abbr to full team name.
      2. Get the correct fits DataFrame for position.
      3. Find 'final_fit' for the given player_name in that DataFrame.
      4. Open {position}_data.csv and do a (binary) search for the same player_name.
      5. Merge final_fit into that CSV row and return it.
    """
    # 1. Validate team
    team_name = TEAM_ABBR_TO_NAME.get(team_abbr.upper())
    if not team_name:
        raise HTTPException(status_code=404, detail=f"Unknown team abbreviation: {team_abbr}")

    # 2. Validate position
    pos_upper = position.upper()
    if pos_upper not in FITS_FUNCTIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported position: {position}")

    # 3. Get fits DataFrame for this team + position
    fits_df = FITS_FUNCTIONS[pos_upper](team_name)
    if fits_df is None or fits_df.empty:
        raise HTTPException(status_code=404, detail=f"No {pos_upper} fits found for team: {team_abbr}")

    # Column name in the DataFrame that has the player's name
    df_name_col = f"{position.lower()}_name"  # e.g., 'wr_name', 'qb_name', etc.

    # Find the player's final_fit
    fits_list = fits_df.to_dict(orient="records")
    final_fit_value = None
    for record in fits_list:
        if record.get(df_name_col, "").strip().lower() == player_name.strip().lower():
            final_fit_value = record.get("final_fit")
            break

    if final_fit_value is None:
        raise HTTPException(
            status_code=404,
            detail=f"No {pos_upper} fit data found for '{player_name}' on team '{team_abbr}'"
        )

    # 4. Read the CSV rows for this position
    rows = read_csv_rows(pos_upper)

    # If your CSV is guaranteed sorted ascending by 'player_name', use binary search:
    matched_row = binary_search_by_name(rows, "player_name", player_name)

    # If not sorted, you could do a linear loop:
    # matched_row = next((row for row in rows
    #                     if row["player_name"].strip().lower() == player_name.strip().lower()), None)

    if not matched_row:
        raise HTTPException(
            status_code=404,
            detail=f"No row in {pos_upper}_data.csv matched name '{player_name}'"
        )

    # 5. Merge final_fit into the CSV row
    matched_row["final_fit"] = final_fit_value

    return matched_row

# --- New Endpoint: /oline ---
@app.get("/oline")
def get_oline_data():
    """
    Reads all rows from oline_data.csv (the computed linemen stats and ratings)
    and returns them as a list of dicts.
    """
    oline_csv = os.path.join(DATA_DIR, "fa_oline.csv")
    data = []
    try:
        with open(oline_csv, newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                data.append(row)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="oline_data.csv not found")
    return data

# --- New Endpoint: /teams/{team_abbr}/olineinfo/{player_name} ---
@app.get("/teams/{team_abbr}/olineinf/{player_name}")
def get_oline_player_info(team_abbr: str, player_name: str):
    """
    Retrieve a given lineman's info for a team from oline_data.csv.
    """
    # Validate team abbreviation and convert to full team name.
    team_name = TEAM_ABBR_TO_NAME.get(team_abbr.upper())
    if not team_name:
        raise HTTPException(status_code=404, detail=f"Unknown team abbreviation: {team_abbr}")

    # Build the path to oline_data.csv.
    oline_csv = os.path.join(DATA_DIR, "fa_oline.csv")
    try:
        with open(oline_csv, newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                if row.get("name", "").strip().lower() == player_name.strip().lower():
                    return row
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="oline_data.csv not found")
    
    raise HTTPException(status_code=404, detail=f"Player '{player_name}' not found")