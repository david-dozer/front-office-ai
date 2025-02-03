import nfl_data_py as nfl
import pandas as pd
import numpy as np
import os

# Load play-by-play data
pbp_data = nfl.import_pbp_data([2024])

# Filter for offensive plays only (excluding special teams & defensive plays)
pbp_offense = pbp_data[
    (pbp_data['play_type'].isin(['pass', 'run'])) & 
    (pbp_data['posteam'].notna())
]

# Select relevant columns
columns_to_keep = [
    "posteam", "week", "pass_attempt", "rush_attempt", "shotgun", "no_huddle",
    "qb_scramble", "first_down_rush", "first_down_pass", "qb_dropback",
    "pass_length", "pass_location", "run_location", "run_gap", "yards_after_catch",
    "play_type", "yards_gained", "air_yards", "epa", "ydstogo", "down"
]
pbp_offense = pbp_offense[columns_to_keep]

def process_team_data(df):
    # Count binary events correctly by checking for 1s
    num_dropbacks = (df["qb_dropback"] == 1).sum()
    num_rush_attempts = (df["rush_attempt"] == 1).sum()
    num_plays = num_dropbacks + num_rush_attempts

    return pd.Series({
        # Use corrected dropback and rush attempt counts
        "pass_to_run": num_dropbacks / num_plays,
        
        # Binary categories need == 1
        "shotgun_freq": (df["shotgun"] == 1).sum() / num_plays,
        "no_huddle_freq": (df["no_huddle"] == 1).sum() / num_plays,
        "short_passes_freq": (df["pass_length"] == "short").sum() / num_plays,
        "deep_passes_freq": (df["pass_length"] == "deep").sum() / num_plays,
        "middle_passes": (df["pass_location"] == "middle").sum() / (df["pass_attempt"] == 1).sum(),
        "side_passes": (df["pass_location"].isin(["left", "right"])).sum() / (df["pass_attempt"] == 1).sum(),
        "scramble_freq": (df["qb_scramble"] == 1).sum() / num_rush_attempts,
        
        # First down events need == 1
        "first_down_rush_pct": (df["first_down_rush"] == 1).sum() / 
                              ((df["first_down_rush"] == 1).sum() + (df["first_down_pass"] == 1).sum()),
        "first_down_pass_pct": (df["first_down_pass"] == 1).sum() / 
                              ((df["first_down_rush"] == 1).sum() + (df["first_down_pass"] == 1).sum()),
        
        # These don't need == 1 as they're averages of continuous values
        "epa_pass": df[df["play_type"] == "pass"]["epa"].mean(),
        "epa_run": df[df["play_type"] == "run"]["epa"].mean(),
        "yac": df[df["play_type"] == "pass"]["yards_after_catch"].mean(),
        
        # Run percentages use play_type which is categorical
        "inside_run_pct": df[(df["play_type"] == "run") & 
                            (df["run_gap"] == "guard") & 
                            (df["run_location"] == "middle")].shape[0] / 
                         df[df["play_type"] == "run"].shape[0],
        "outside_run_pct": df[(df["play_type"] == "run") & 
                             (df["run_gap"].isin(["tackle", "end"])) & 
                             (df["run_location"] != "middle")].shape[0] / 
                         df[df["play_type"] == "run"].shape[0],
        
        # Down-based stats use numerical values
        "yards_gained_1": df[df["down"] == 1]["yards_gained"].mean(),
        "yards_gained_2": df[df["down"] == 2]["yards_gained"].mean(),
        "yards_gained_3": df[df["down"] == 3]["yards_gained"].mean(),
        "yards_gained_4": df[df["down"] == 4]["yards_gained"].mean(),
        "ydstogo_3rd_down": df[df["down"] == 3]["ydstogo"].mean()
    })

# Filter for regular season weeks only
pbp_offense = pbp_offense[pbp_offense['week'].between(1, 18)]

# Aggregate stats per game for each team
team_weekly_data = pbp_offense.groupby(["posteam", "week"]).apply(process_team_data).reset_index()

# Compute seasonal averages for each team (without week)
team_seasonal_data = pbp_offense.groupby("posteam").apply(process_team_data).reset_index()

# Dictionary of offensive schemes
team_schemes = {
    "MIN": "McVay System", "LAR": "McVay System",
    "WAS": "Air Raid", "PHI": "Spread Option",
    "LAC": "Coryell Vertical", "GB": "West Coast",
    "PIT": "Run Power", "NYG": "Pistol Power Spread",
    "SF": "Shanahan Wide Zone"
}

# Assign schemes to seasonal data
team_seasonal_data["scheme"] = team_seasonal_data["posteam"].map(team_schemes)

# Create directories if they don't exist
os.makedirs("team_offense_pbp", exist_ok=True)
# Filter for regular season weeks only
pbp_offense = pbp_offense[pbp_offense['week'].between(1, 18)]
os.makedirs("processed_data", exist_ok=True)

# Save raw play-by-play data for each team
for team in pbp_offense['posteam'].unique():
    if pd.notna(team):  # Check if team name is not NaN
        team_data = pbp_offense[pbp_offense['posteam'] == team]
        output_path = f"team_offense_pbp/{team}.csv"
        team_data.to_csv(output_path, index=False)
        print(f"Saved {team} data to {output_path}")

# Save processed data
team_weekly_data.to_csv("processed_data/team_weekly_stats.csv", index=False)
team_seasonal_data.to_csv("processed_data/team_seasonal_stats.csv", index=False)

print("\nData saved to CSVs:")
print("1. Individual team play-by-play data: team_offense_pbp/[TEAM].csv")
print("2. Weekly team statistics: processed_data/team_weekly_stats.csv")
print("3. Season averages: processed_data/team_seasonal_stats.csv")

# Print some basic stats
print("\nSummary:")
print(f"Number of teams processed: {len(pbp_offense['posteam'].unique())}")
print(f"Number of weeks: {len(pbp_offense['week'].unique())}")
print(f"Total plays processed: {len(pbp_offense)}")