import pandas as pd
import os
from data_loader import load_pbp_data, nfl

def process_team_data(df):
    """
    Process team statistics from play-by-play data.
    """
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
        "short_passes_freq": (df["pass_length"] == "short").sum() / (df["pass_attempt"] == 1).sum(),
        "deep_passes_freq": (df["pass_length"] == "deep").sum() / (df["pass_attempt"] == 1).sum(),
        "middle_passes": (df["pass_location"] == "middle").sum() / (df["pass_attempt"] == 1).sum(),
        "side_passes": (df["pass_location"].isin(["left", "right"])).sum() / (df["pass_attempt"] == 1).sum(),
        
        # Scramble frequency
        "scramble_freq": (df["qb_scramble"] == 1).sum() / num_dropbacks if num_dropbacks > 0 else 0,
        
        # First down play selection
        "first_down_rush_pct": (df["first_down_rush"] == 1).sum() / ((df["first_down_rush"] == 1).sum() + (df["first_down_pass"] == 1).sum()),
        
        # EPA metrics
        "epa_pass": df[df["play_type"] == "pass"]["epa"].mean(),
        "epa_run": df[df["play_type"] == "run"]["epa"].mean(),
        
        # YAC
        "yac": df["yards_after_catch"].mean(),
        
        # Run location metrics
        "inside_run_pct": df[(df["play_type"] == "run") & 
                              (df["run_gap"].isin(["tackle", "guard"])) | 
                              (df["run_location"] == "middle")].shape[0] / \
                           df[df["play_type"] == "run"].shape[0] if df[df["play_type"] == "run"].shape[0] > 0 else 0,
        
        "outside_run_pct": df[(df["play_type"] == "run") & 
                               (df["run_gap"] == "end")].shape[0] / \
                           df[df["play_type"] == "run"].shape[0] if df[df["play_type"] == "run"].shape[0] > 0 else 0,
        
        # Down-based stats
        "yards_gained_1": df[df["down"] == 1]["yards_gained"].mean(),
        "yards_gained_2": df[df["down"] == 2]["yards_gained"].mean(),
        "yards_gained_3": df[df["down"] == 3]["yards_gained"].mean(),
        "yards_gained_4": df[df["down"] == 4]["yards_gained"].mean(),
        "ydstogo_3rd_down": df[df["down"] == 3]["ydstogo"].mean(),
        
        # Average air yards for passes
        "avg_air_yards": df[df["play_type"] == "pass"]["air_yards"].mean()
    })

def main():
    # Load data using the common loader
    pbp_offense = load_pbp_data()
    
    # Filter for regular season
    pbp_offense = pbp_offense[pbp_offense['week'].between(1, 18)]
    
    # Calculate weekly stats
    team_weekly_data = pbp_offense.groupby(["posteam", "week"]).apply(process_team_data).reset_index()
    team_weekly_data = team_weekly_data.drop(columns=["week"])

    # Calculate seasonal stats
    team_seasonal_data = pbp_offense.groupby("posteam").apply(process_team_data).reset_index()

    # Calculate league averages
    league_average = team_seasonal_data.mean(numeric_only=True)  # Calculate mean for numeric columns
    league_average['posteam'] = 'LGAVG'  # Set the posteam to 'LGAVG'
    
    # Append league average to the seasonal data
    league_average_df = pd.DataFrame([league_average])
    team_seasonal_data = pd.concat([team_seasonal_data, league_average_df], ignore_index=True)

     # Import team description data and select the required columns
    team_desc = nfl.import_team_desc()[['team_abbr', 'team_conf', 'team_division', 'team_name', 'team_logo_espn', 'team_color']]
    
    # Merge the team description columns into both the weekly and seasonal data
    # team_weekly_data = team_weekly_data.merge(team_desc, left_on='posteam', right_on='team_abbr', how='left')
    team_seasonal_data = team_seasonal_data.merge(team_desc, left_on='posteam', right_on='team_abbr', how='left')
    
    # Optionally, drop the redundant 'team_abbr' column after the merge
    # team_weekly_data = team_weekly_data.drop(columns=["team_abbr"])
    team_seasonal_data = team_seasonal_data.drop(columns=["team_abbr"])
    # Move 'team_name' column to the right of 'posteam'
    team_seasonal_data = team_seasonal_data[['posteam', 'team_name'] + [col for col in team_seasonal_data.columns if col not in ['posteam', 'team_name']]]

    # Create processed_data directory if it doesn't exist
    os.makedirs("processed_data", exist_ok=True)
    
    # Save processed data
    team_weekly_data.to_csv("backend/processed_data/team_weekly_stats.csv", index=False)
    team_seasonal_data.to_csv("backend/processed_data/team_seasonal_stats.csv", index=False)
    
    print("\nData saved to CSVs:")
    print("1. Weekly team statistics: processed_data/team_weekly_stats.csv")
    print("2. Season averages: processed_data/team_seasonal_stats.csv")
    
    # Print some basic stats
    print("\nSummary:")
    print(f"Number of teams processed: {len(pbp_offense['posteam'].unique())}")
    print(f"Number of weeks: {len(pbp_offense['week'].unique())}")
    print(f"Total plays processed: {len(pbp_offense)}")

if __name__ == "__main__":
    main()