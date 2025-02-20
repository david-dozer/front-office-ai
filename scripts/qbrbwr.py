# qbrbwr.py
import nfl_data_py as nfl
import pandas as pd
from playerscrape import scrape_free_agents, off_url
import numpy as np

# --- Define column lists ---

# Common roster columns that we want to keep
COMMON_ROSTER_COLUMNS = [
    'player_name', 'first_name', 'last_name', 'football_name', 'age', 'years_exp', 'height', 'weight', 'headshot_url'
]

# Seasonal stats columns for each position
QB_SEASONAL_COLUMNS = [
    # Passing metrics
    'player_id', 'season', 'season_type', 'completions', 'attempts', 'passing_yards',
    'passing_tds', 'interceptions', 'sacks', 'sack_yards', 'sack_fumbles', 'sack_fumbles_lost',
    'passing_air_yards', 'passing_yards_after_catch', 'passing_first_downs', 'passing_epa',
    'passing_2pt_conversions', 'pacr', 'dakota',
    # Rushing metrics (for mobility)
    'carries', 'rushing_yards', 'rushing_tds', 'rushing_fumbles',
    'rushing_fumbles_lost', 'rushing_first_downs', 'rushing_epa', 'rushing_2pt_conversions',
    # Overall production
    'fantasy_points', 'fantasy_points_ppr', 'games'
]

RB_SEASONAL_COLUMNS = [
    'player_id', 'season', 'season_type',
    # Rushing metrics
    'carries', 'rushing_yards', 'rushing_tds', 'rushing_fumbles',
    'rushing_fumbles_lost', 'rushing_first_downs', 'rushing_epa', 'rushing_2pt_conversions',
    # Receiving metrics
    'receptions', 'targets', 'receiving_yards', 'receiving_tds', 'receiving_fumbles',
    'receiving_fumbles_lost', 'receiving_air_yards', 'receiving_yards_after_catch',
    'receiving_first_downs', 'receiving_epa', 'receiving_2pt_conversions',
    # Advanced receiving
    'racr', 'target_share', 'air_yards_share',
    # Overall production
    'fantasy_points', 'fantasy_points_ppr', 'games'
]

WR_SEASONAL_COLUMNS = [
    'player_id', 'season', 'season_type',
    # Receiving metrics
    'receptions', 'targets', 'receiving_yards', 'receiving_tds', 'receiving_fumbles',
    'receiving_fumbles_lost', 'receiving_air_yards', 'receiving_yards_after_catch',
    'receiving_first_downs', 'receiving_epa', 'receiving_2pt_conversions',
    # Advanced receiving
    'racr', 'target_share', 'air_yards_share', 'wopr_x',
    # Overall production
    'fantasy_points', 'fantasy_points_ppr', 'games'
]

# --- Functions to retrieve and merge data ---

def get_seasonal_data(years):
    """
    Retrieve the seasonal stats.
    """
    df_seasonal = nfl.import_seasonal_data(years)
    return df_seasonal

def get_roster_data(year):
    """
    Retrieve the roster data and select only the needed columns.
    Note: We also include 'player_id' and 'position' (for filtering)
    even if they're not part of the common output.
    """
    df_roster = nfl.import_seasonal_rosters(year)
    roster_columns = ['player_id', 'position'] + COMMON_ROSTER_COLUMNS
    df_roster = df_roster[roster_columns]
    return df_roster

def merge_seasonal_and_roster(df_seasonal, df_roster):
    """
    Merge seasonal stats with roster information using player_id.
    """
    df_merged = df_seasonal.merge(df_roster, on='player_id', how='left')
    return df_merged

def filter_by_position(df, position):
    """
    Filter the merged dataframe by the given position.
    """
    return df[df['position'] == position].copy()

def get_position_df(df_merged, position, seasonal_columns):
    """
    Get the final dataframe for a given position by selecting
    the appropriate seasonal columns and common roster columns.
    """
    df_pos = filter_by_position(df_merged, position)
    final_columns = seasonal_columns + COMMON_ROSTER_COLUMNS
    # Use intersection to avoid key errors if some columns are missing
    final_columns = [col for col in final_columns if col in df_pos.columns]
    return df_pos[final_columns]

def adjust_roster_columns(df):
    """
    Drop unnecessary columns and reorder so that 'player_name' is first.
    """
    df = df.copy()
    cols_to_drop = [col for col in ['first_name', 'player_id', 'last_name', 'football_name'] if col in df.columns]
    df.drop(columns=cols_to_drop, inplace=True)
    
    cols = df.columns.tolist()
    if 'player_name' in cols:
        cols.remove('player_name')
        cols.insert(0, 'player_name')
    if 'headshot_url' in cols:
        cols.remove('headshot_url')
        cols.append('headshot_url')
    df = df[cols]
    
    return df

def get_next_gen_stats(player_name, position):
    """
    Get aggregated Next Gen Stats for a player across all their games.
    
    Args:
        player_name (str): The player's name
        position (str): Player position (QB, RB, or WR)
    
    Returns:
        dict: Aggregated next gen stats for the player, or None if not found
    """
    try:
        # Define position-specific metrics and file paths
        if position == 'QB':
            file_path = 'processed_data/qb_ngs.csv'
            key_metrics = [
                'avg_time_to_throw',
                'avg_completed_air_yards',
                'avg_intended_air_yards',
                'avg_air_yards_differential',
                'aggressiveness',
                'avg_air_yards_to_sticks',
                'passer_rating',
                'completion_percentage',
                'expected_completion_percentage',
                'completion_percentage_above_expectation'
            ]
        elif position == 'RB':
            file_path = 'processed_data/rb_ngs.csv'
            key_metrics = [
                'efficiency',
                'percent_attempts_gte_eight_defenders',
                'avg_time_to_los',
                'avg_rush_yards',
                'expected_rush_yards',
                'rush_yards_over_expected',
                'rush_yards_over_expected_per_att',
                'rush_pct_over_expected'
            ]
        elif position == 'WR':
            file_path = 'processed_data/wr_ngs.csv'
            key_metrics = [
                'avg_cushion',
                'avg_separation',
                'avg_intended_air_yards',
                'percent_share_of_intended_air_yards',
                'catch_percentage',
                'avg_yac',
                'avg_expected_yac',
                'avg_yac_above_expectation'
            ]
        else:
            return None
            
        # Read the NGS data
        ngs_df = pd.read_csv(file_path)
        
        # Filter for the specific player
        player_mask = (ngs_df['player_display_name'] == player_name)
        player_stats = ngs_df[player_mask]
        
        if len(player_stats) == 0:
            return None
            
        # Calculate averages for all metrics
        agg_stats = {metric: player_stats[metric].mean() for metric in key_metrics}
        return agg_stats
        
    except FileNotFoundError:
        print(f"Warning: Next Gen Stats file not found for {player_name}")
        return None
    except Exception as e:
        print(f"Error processing Next Gen Stats for {player_name}: {e}")
        return None

# --- Main Execution ---

def main():
    # Retrieve NFL data
    print("Loading seasonal and roster data...")
    df_seasonal = get_seasonal_data([2024])
    df_roster = get_roster_data([2024])
    
    # Merge the two data sources on player_id
    df_merged = merge_seasonal_and_roster(df_seasonal, df_roster)
    
    # Create position-specific dataframes
    print("Filtering data for QBs, RBs, and WRs...")
    qb_df = get_position_df(df_merged, 'QB', QB_SEASONAL_COLUMNS)
    rb_df = get_position_df(df_merged, 'RB', RB_SEASONAL_COLUMNS)
    wr_df = get_position_df(df_merged, 'WR', WR_SEASONAL_COLUMNS)

    # Scrape free agent data from Spotrac using playerscrape
    print("Scraping free agent data from Spotrac...")
    free_agents_df = scrape_free_agents(off_url)
    
    # Merge the free agent data with the NFL data (inner join to keep only free agents)
    qb_df = qb_df.merge(free_agents_df, left_on='player_name', right_on='Name', how='inner')
    rb_df = rb_df.merge(free_agents_df, left_on='player_name', right_on='Name', how='inner')
    wr_df = wr_df.merge(free_agents_df, left_on='player_name', right_on='Name', how='inner')

    # Add Next Gen Stats to position dataframes
    print("Adding Next Gen Stats...")
    for df, pos in [(qb_df, 'QB'), (rb_df, 'RB'), (wr_df, 'WR')]:
        for idx, row in df.iterrows():
            ngs_stats = get_next_gen_stats(row['player_name'], pos)
            if ngs_stats:
                for stat, value in ngs_stats.items():
                    df.loc[idx, f'ngs_{stat}'] = value

    # Print the number of rows for each position after filtering
    print(f"QB Data (free agents): {qb_df.shape[0]} rows")
    print(f"RB Data (free agents): {rb_df.shape[0]} rows")
    print(f"WR Data (free agents): {wr_df.shape[0]} rows")

    # Drop the "Name" column from each dataframe
    qb_df = qb_df.drop(columns=['Name'])
    rb_df = rb_df.drop(columns=['Name'])
    wr_df = wr_df.drop(columns=['Name'])

    # TODO: Add Next Gen Stats to each position dataframe after filtering
   

    qb_df = adjust_roster_columns(qb_df)
    rb_df = adjust_roster_columns(rb_df)
    wr_df = adjust_roster_columns(wr_df)

    # Sort dataframes by respective yardage stats (descending order)
    qb_df = qb_df.sort_values('passing_yards', ascending=False)
    rb_df = rb_df.sort_values('rushing_yards', ascending=False)
    wr_df = wr_df.sort_values('receiving_yards', ascending=False)

    # Save these DataFrames to CSV files
    qb_df.to_csv('qb_data.csv', index=False)
    rb_df.to_csv('rb_data.csv', index=False)
    wr_df.to_csv('wr_data.csv', index=False)

if __name__ == "__main__":
    main()
