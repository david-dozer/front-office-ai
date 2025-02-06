import nfl_data_py as nfl
import pandas as pd

def load_pbp_data():
    """
    Load and filter NFL play-by-play data.
    """
    # Load play-by-play data
    pbp_data = nfl.import_pbp_data([2024])
    
    # Filter for offensive plays only
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
    
    return pbp_offense 