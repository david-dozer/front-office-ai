import nfl_data_py as nfl
import pandas as pd

# Load play-by-play data
pbp_data = nfl.import_pbp_data([2024])

# Filter plays where the Bears were the posteam
bears_plays = pbp_data[(pbp_data['posteam'] == 'CHI') & (pbp_data['play_type'].notna()) & (pbp_data['play_type'].isin(['pass', 'run']))]

# Select relevant columns
columns_to_keep = ["play_type", "yards_gained", "shotgun", "no_huddle", "qb_dropback", "pass_length", "pass_location", "air_yards", "yards_after_catch", "run_location", "run_gap"]
bears_plays = bears_plays[columns_to_keep]

# Print out plays
print(bears_plays)