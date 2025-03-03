import os
import pandas as pd
from data_loader import load_pbp_data, nfl
import scheme           # make sure scheme.py contains apply_offensive_scheme() as defined earlier
from teamscrape import scrape_team_cap_data

def process_team_data(df):
    """
    Process team statistics from play-by-play data.
    """
    # Count binary events correctly by checking for 1s
    num_dropbacks = (df["qb_dropback"] == 1).sum()
    num_rush_attempts = (df["rush_attempt"] == 1).sum()
    num_plays = num_dropbacks + num_rush_attempts

    return pd.Series({
        "pass_to_run": num_dropbacks / num_plays,
        "shotgun_freq": (df["shotgun"] == 1).sum() / num_plays,
        "no_huddle_freq": (df["no_huddle"] == 1).sum() / num_plays,
        "short_passes_freq": (df["pass_length"] == "short").sum() / (df["pass_attempt"] == 1).sum(),
        "deep_passes_freq": (df["pass_length"] == "deep").sum() / (df["pass_attempt"] == 1).sum(),
        "middle_passes": (df["pass_location"] == "middle").sum() / (df["pass_attempt"] == 1).sum(),
        "side_passes": (df["pass_location"].isin(["left", "right"])).sum() / (df["pass_attempt"] == 1).sum(),
        "scramble_freq": (df["qb_scramble"] == 1).sum() / num_dropbacks if num_dropbacks > 0 else 0,
        "first_down_rush_pct": (df["first_down_rush"] == 1).sum() / ((df["first_down_rush"] == 1).sum() + (df["first_down_pass"] == 1).sum()),
        "epa_pass": df[df["play_type"] == "pass"]["epa"].mean(),
        "epa_run": df[df["play_type"] == "run"]["epa"].mean(),
        "yac": df["yards_after_catch"].mean(),
        "inside_run_pct": df[(df["play_type"] == "run") & 
                              ((df["run_gap"].isin(["tackle", "guard"])) | (df["run_location"] == "middle"))].shape[0] / \
                           df[df["play_type"] == "run"].shape[0] if df[df["play_type"] == "run"].shape[0] > 0 else 0,
        "outside_run_pct": df[(df["play_type"] == "run") & (df["run_gap"] == "end")].shape[0] / \
                           df[df["play_type"] == "run"].shape[0] if df[df["play_type"] == "run"].shape[0] > 0 else 0,
        "yards_gained_1": df[df["down"] == 1]["yards_gained"].mean(),
        "yards_gained_2": df[df["down"] == 2]["yards_gained"].mean(),
        "yards_gained_3": df[df["down"] == 3]["yards_gained"].mean(),
        "yards_gained_4": df[df["down"] == 4]["yards_gained"].mean(),
        "ydstogo_3rd_down": df[df["down"] == 3]["ydstogo"].mean(),
        "avg_air_yards": df[df["play_type"] == "pass"]["air_yards"].mean()
    })

def main():
    # --- Load and process play-by-play data ---
    pbp_offense = load_pbp_data()
    pbp_offense = pbp_offense[pbp_offense['week'].between(1, 18)]

    # Calculate weekly team stats
    team_weekly_data = pbp_offense.groupby(["posteam", "week"]).apply(process_team_data).reset_index()
    team_weekly_data = team_weekly_data.drop(columns=["week"])

    # Calculate seasonal team stats
    team_seasonal_data = pbp_offense.groupby("posteam").apply(process_team_data).reset_index()

    # Calculate league average and append to seasonal stats
    league_average = team_seasonal_data.mean(numeric_only=True)
    league_average['posteam'] = 'LGAVG'
    league_average_df = pd.DataFrame([league_average])
    team_seasonal_data = pd.concat([team_seasonal_data, league_average_df], ignore_index=True)

    # Import team description data and merge (if needed)
    team_desc = nfl.import_team_desc()[['team_abbr', 'team_conf', 'team_division', 'team_name', 'team_logo_espn', 'team_color', 'team_color2']]
    team_seasonal_data = team_seasonal_data.merge(team_desc, left_on='posteam', right_on='team_abbr', how='left')
    team_seasonal_data = team_seasonal_data.drop(columns=["team_abbr"])
    team_seasonal_data = team_seasonal_data[['posteam', 'team_name'] + [col for col in team_seasonal_data.columns if col not in ['posteam', 'team_name']]]

    # Create directory if needed and save weekly and seasonal stats
    os.makedirs("backend/processed_data", exist_ok=True)
    team_weekly_data.to_csv("backend/processed_data/team_weekly_stats.csv", index=False)
    team_seasonal_data.to_csv("backend/processed_data/team_seasonal_stats.csv", index=False)

    print("\nData saved to CSVs:")
    print("1. Weekly team statistics: backend/processed_data/team_weekly_stats.csv")
    print("2. Season averages: backend/processed_data/team_seasonal_stats.csv")

    # --- Apply Offensive Scheme ---
    # This function reads the saved seasonal and weekly stats, computes scheme scores,
    # assigns schemes, and writes back to the seasonal stats CSV.
    scheme.apply_offensive_scheme()

    # --- Merge Team Cap Data and Merge ---
    cap_df = scrape_team_cap_data()  # Scrapes and saves ../processed_data/team_cap_data.csv
    # Read the updated seasonal stats (which now includes scheme information)
    seasonal_stats = pd.read_csv("backend/processed_data/team_seasonal_stats.csv")
    
    # Merge on team abbreviation; in cap_df the team abbreviation is in the "Team" column,
    # while in seasonal_stats it is in "posteam".
    merged_stats = pd.merge(seasonal_stats, cap_df[['Team', 'Cap Space All']], left_on='posteam', right_on='Team', how='left')
    # Optionally drop the redundant 'Team' column and rename 'Cap Space All' to 'cap_space_all'
    merged_stats = merged_stats.drop(columns=['Team']).rename(columns={'Cap Space All': 'cap_space_all'})
    
    # Save the final CSV
    merged_stats.to_csv("backend/processed_data/team_seasonal_stats.csv", index=False)

    # --- Merge Team Offense Stats ---
    offense_stats = pd.read_csv("backend/processed_data/team_offense_stats.csv")
    merged_stats = pd.merge(merged_stats, offense_stats, left_on='team_name', right_on='Tm', how='left')
    merged_stats = merged_stats.drop(columns=['Rk', 'Tm', 'G'])

    # Define the columns and whether a lower value is better (True for ascending rank)
    columns_to_rank = {
        "PointsScored": False,   # higher is better, so descending
        "TotalYds": False,       # higher is better
        "TotalTO": True,         # lower is better
        "PassingYds": False,     # higher is better
        "PassingTD": False,      # higher is better
        "Int": True,             # lower is better
        "Passing1stD": False,    # higher is better
        "Y/A": False,            # higher is better
        "RushingYds": False,     # higher is better
        "RushingTD": False,      # higher is better
        "PctScoreDrives": False, # higher is better
        "TO%": True              # lower is better
    }

    for col, ascending in columns_to_rank.items():
        merged_stats[col + "_Rank"] = merged_stats[col].rank(ascending=ascending, method="min")

    # save csv
    merged_stats.to_csv("backend/processed_data/team_seasonal_stats.csv", index=False)
    
    print("\nFinal seasonal stats updated with Cap Space All and offense stats, and saved to backend/processed_data/team_seasonal_stats.csv")

if __name__ == "__main__":
    main()
