import nfl_data_py as nfl
import pandas as pd
from playerscrape import get_available_free_agents, scrape_market_values_concurrently, off_url
import numpy as np
import re

# --- Define column lists ---
COMMON_ROSTER_COLUMNS = [
    'player_name', 'first_name', 'last_name', 'football_name',
    'age', 'years_exp', 'height', 'weight', 'headshot_url'
]

QB_SEASONAL_COLUMNS = [
    'player_id', 'season', 'season_type', 'completions', 'attempts', 'passing_yards',
    'passing_tds', 'interceptions', 'sacks', 'sack_yards', 'sack_fumbles', 'sack_fumbles_lost',
    'passing_air_yards', 'passing_yards_after_catch', 'passing_first_downs', 'passing_epa',
    'passing_2pt_conversions', 'pacr', 'dakota',
    'carries', 'rushing_yards', 'rushing_tds', 'rushing_fumbles',
    'rushing_fumbles_lost', 'rushing_first_downs', 'rushing_epa', 'rushing_2pt_conversions',
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

# --- Data Import Functions ---
def get_seasonal_data(years):
    """Import seasonal stats for the given years (e.g., 2022, 2023, 2024)."""
    return nfl.import_seasonal_data(years)

def get_roster_data(years=[2024]):
    """Import roster data only from the specified year (2024)."""
    df_roster = nfl.import_seasonal_rosters(years)
    roster_columns = ['player_id', 'position'] + COMMON_ROSTER_COLUMNS
    return df_roster[roster_columns]

def merge_seasonal_and_roster(seasonal_df, roster_df):
    """Merge seasonal stats with 2024 roster info using player_id."""
    return pd.merge(seasonal_df, roster_df, on='player_id', how='left')

# --- Active Selection Logic ---
def select_pos_active_season(group, position):
    """
    For a given player's seasonal data (grouped by player_id) and position, select the row corresponding
    to the most recent active season based on the following criteria:
      - QB: active if 'attempts' >= 100
      - RB: active if 'carries' >= 75
      - WR: active if 'targets' >= 40
    If no season meets the criteria (from 2024 down to 2022), return the row with the highest value
    of the corresponding metric.
    """
    if position == 'QB':
        metric = 'attempts'
        threshold = 100
    elif position == 'RB':
        metric = 'carries'
        threshold = 75
    elif position == 'WR':
        metric = 'targets'
        threshold = 40
    elif position == 'TE':
        metric = 'targets'
        threshold = 30
    else:
        # Default to QB criteria if position is unknown
        metric = 'attempts'
        threshold = 100

    # Check seasons in order: 2024, then 2023, then 2022
    # Check seasons in order: 2024, then 2023, then 2022
    for season in [2024, 2023, 2022]:
        candidate = group[(group['season'] == season) & (group[metric] >= threshold)]
        if not candidate.empty:
            selected_row = candidate.iloc[0]
            break
    else:
        # If no season meets the threshold, pick the season with the highest value in the metric
        selected_row = group.loc[group[metric].idxmax()]
    
    # Normalize per-game stats before returning the row
    if position in ['RB', 'WR', 'TE'] and 'target_share' in selected_row:
        if selected_row['games'] > 0:
            selected_row['target_share'] /= selected_row['games']
        else:
            selected_row['target_share'] = np.nan  # Avoid division by zero
    
    return selected_row

# --- Roster Column Adjustments ---
def adjust_roster_columns(df):
    """
    Drop extraneous roster columns and reorder so that 'player_name' appears first and
    'headshot_url' is moved to the end.
    """
    df = df.copy()
    cols_to_drop = [col for col in ['first_name', 'last_name', 'football_name'] if col in df.columns]
    df.drop(columns=cols_to_drop, inplace=True)
    
    cols = df.columns.tolist()
    if 'player_name' in cols:
        cols.remove('player_name')
        cols.insert(0, 'player_name')
    if 'headshot_url' in cols:
        cols.remove('headshot_url')
        cols.append('headshot_url')
    return df[cols]

# --- Next Gen Stats Function ---
def get_next_gen_stats(player_id, position, seasons=[2024, 2023, 2022]):
    """
    For a given player_id and position, look up Next Gen Stats from the appropriate CSV file.
    The function returns only the key metrics for the position.
    
    For active seasons (week == 0) the function returns that row's key metrics.
    If no active season is found (for the given seasons), it returns the average of the available rows.
    
    Key metrics per position:
      - QB:
          'avg_time_to_throw', 'avg_completed_air_yards', 'avg_intended_air_yards',
          'avg_air_yards_differential', 'aggressiveness', 'avg_air_yards_to_sticks',
          'passer_rating', 'completion_percentage', 'expected_completion_percentage',
          'completion_percentage_above_expectation'
      - RB:
          'efficiency', 'percent_attempts_gte_eight_defenders', 'avg_time_to_los',
          'avg_rush_yards', 'expected_rush_yards', 'rush_yards_over_expected',
          'rush_yards_over_expected_per_att', 'rush_pct_over_expected'
      - WR:
          'avg_cushion', 'avg_separation', 'avg_intended_air_yards',
          'percent_share_of_intended_air_yards', 'catch_percentage', 'avg_yac',
          'avg_expected_yac', 'avg_yac_above_expectation'
    """
    try:
        if position == 'QB':
            file_path = 'backend/processed_data/qb_ngs.csv'
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
            file_path = 'backend/processed_data/rb_ngs.csv'
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
        elif position == 'WR' or position == 'TE':
            file_path = 'backend/processed_data/wr_ngs.csv'
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

        ngs_df = pd.read_csv(file_path)
        player_ngs = ngs_df[ngs_df['player_gsis_id'] == player_id]
        if player_ngs.empty:
            return None

        # Look for an active season row (week == 0) in order of seasons
        for season in seasons:
            row = player_ngs[(player_ngs['season'] == season) & (player_ngs['week'] == 0)]
            if not row.empty:
                active_stats = row.iloc[0].to_dict()
                return {metric: active_stats.get(metric) for metric in key_metrics}

        # If no active season, average the key metrics over all available rows
        agg_stats = {metric: player_ngs[metric].mean() for metric in key_metrics if metric in player_ngs.columns}
        return agg_stats

    except FileNotFoundError:
        print(f"Warning: Next Gen Stats file not found for player {player_id}")
        return None
    except Exception as e:
        print(f"Error processing Next Gen Stats for player {player_id}: {e}")
        return None

# --- Main Execution ---
def main():
    # Step 1: Import seasonal data for 2022-2024 and roster data from 2024, then merge
    print("Loading seasonal data for 2022-2024 and 2024 rosters...")
    seasonal_df = get_seasonal_data([2022, 2023, 2024])
    roster_df = get_roster_data([2024])
    merged_df = merge_seasonal_and_roster(seasonal_df, roster_df)
    
    # Process for each position: QB, RB, and WR
    positions = ['QB', 'RB', 'WR', 'TE']
    final_dfs = {}
    
    for pos in positions:
        # Filter merged data to only include the current position
        pos_df = merged_df[merged_df['position'] == pos].copy()
        
        # Group by player_id and select the most recent active season based on criteria:
        #  - QB: 'attempts' >= 100
        #  - RB: 'carries' >= 75
        #  - WR: 'targets' >= 40
        selected = pos_df.groupby('player_id').apply(lambda group: select_pos_active_season(group, pos)).reset_index(drop=True)
        
        # Limit the dataframe to the appropriate seasonal columns + common roster columns for the position
        if pos == 'QB':
            final_columns = QB_SEASONAL_COLUMNS + COMMON_ROSTER_COLUMNS
        elif pos == 'RB':
            final_columns = RB_SEASONAL_COLUMNS + COMMON_ROSTER_COLUMNS
        elif pos == 'WR' or pos == 'TE':
            final_columns = WR_SEASONAL_COLUMNS + COMMON_ROSTER_COLUMNS
        # Ensure only columns that exist in the dataframe are used
        final_columns = [col for col in final_columns if col in selected.columns]
        pos_final = selected[final_columns].copy()
        
        # Step 3: Add Next Gen Stats for each player using player_id
        for idx, row in pos_final.iterrows():
            player_id = row['player_id']
            ngs_stats = get_next_gen_stats(player_id, pos)
            if ngs_stats:
                for stat, value in ngs_stats.items():
                    pos_final.loc[idx, f'ngs_{stat}'] = value
        
        # Adjust roster columns and sort by player_name
        pos_final = adjust_roster_columns(pos_final)
        pos_final = pos_final.sort_values('player_name', ascending=True)
        final_dfs[pos] = pos_final
        print(f"Number of {pos} rows after selection: {pos_final.shape[0]}")
    
    # Save the final dataframes for each position to CSV files in the processed_data folder
    final_dfs['QB'].to_csv('backend/processed_data/qb_data.csv', index=False)
    final_dfs['RB'].to_csv('backend/processed_data/rb_data.csv', index=False)
    final_dfs['WR'].to_csv('backend/processed_data/wr_data.csv', index=False)
    # final_dfs['TE'] = final_dfs['TE'].sort_values('targets', ascending=False)
    final_dfs['TE'].to_csv('backend/processed_data/te_data.csv', index=False)
    print("Saved qb_data.csv, rb_data.csv, wr_data.csv, and te_data.csv to processed_data folder.")
    
    # Step 4: Scrape free agents from Spotrac and merge with the QB data
    print("Scraping free agent data from Spotrac...")
    # free_agents_df = scrape_free_agents(off_url)
    free_agents_df = get_available_free_agents(off_url)
    free_agents_df = scrape_market_values_concurrently(free_agents_df, max_workers=5, delay=0.2)

    def only_alpha_lower(s):
        """Return only alphabetic characters in lowercase (drop spaces, punctuation, etc.)."""
        if pd.isna(s):
            return None
        return re.sub(r'[^a-z]', '', s.lower())

    # Make copies so we don't modify the originals
    fa_qb_df = final_dfs['QB'].copy()
    fa_rb_df = final_dfs['RB'].copy()
    fa_wr_df = final_dfs['WR'].copy()
    fa_te_df = final_dfs['TE'].copy()

    free_agents_copy = free_agents_df.copy()

    # Create temporary clean-name columns for each dataset
    fa_qb_df['player_name_clean'] = fa_qb_df['player_name'].apply(only_alpha_lower)
    fa_rb_df['player_name_clean'] = fa_rb_df['player_name'].apply(only_alpha_lower)
    fa_wr_df['player_name_clean'] = fa_wr_df['player_name'].apply(only_alpha_lower)
    fa_te_df['player_name_clean'] = fa_te_df['player_name'].apply(only_alpha_lower)

    free_agents_copy['Name_clean'] = free_agents_copy['Name'].apply(only_alpha_lower)

    # Now merge on the clean columns
    fa_qb_merged = fa_qb_df.merge(
        free_agents_copy, 
        left_on='player_name_clean', 
        right_on='Name_clean', 
        how='inner'
    )

    fa_rb_merged = fa_rb_df.merge(
        free_agents_copy, 
        left_on='player_name_clean', 
        right_on='Name_clean', 
        how='inner'
    )

    fa_wr_merged = fa_wr_df.assign(player_name_lower=fa_wr_df['player_name'].str.lower()) \
    .merge(
        free_agents_copy.assign(name_lower=free_agents_copy['Name'].str.lower()),
        left_on='player_name_lower',
        right_on='name_lower',
        how='inner'
    )

    fa_te_merged = fa_te_df.merge(
        free_agents_copy, 
        left_on='player_name_clean', 
        right_on='Name_clean', 
        how='inner'
    )

    # Drop the temporary columns if you no longer need them
    fa_qb_merged.drop(['player_name_clean', 'Name_clean'], axis=1, inplace=True)
    fa_rb_merged.drop(['player_name_clean', 'Name_clean'], axis=1, inplace=True)
    fa_wr_merged.drop(['player_name_lower', 'name_lower'], axis=1, inplace=True)
    fa_te_merged.drop(['player_name_clean', 'Name_clean'], axis=1, inplace=True)
    
    # Sort TE dataframe by 'targets'
    # fa_te_df = fa_te_df.sort_values('targets', ascending=False)

    # Sort all dataframes by 'player_id' in ascending order and print the number of rows for each free agent dataframe
    fa_qb_merged = fa_qb_merged.sort_values(by='player_id', ascending=True)
    fa_rb_merged = fa_rb_merged.sort_values(by='player_id', ascending=True)
    fa_wr_merged = fa_wr_merged.sort_values(by='player_id', ascending=True)
    fa_te_merged = fa_te_merged.sort_values(by='player_id', ascending=True)

    print(f"Number of FA QB rows: {fa_qb_merged.shape[0]}")
    print(f"Number of FA RB rows: {fa_rb_merged.shape[0]}")
    print(f"Number of FA WR rows: {fa_wr_merged.shape[0]}")
    print(f"Number of FA TE rows: {fa_te_merged.shape[0]}")
    
    fa_qb_merged.to_csv('backend/processed_data/fa_qbs.csv', index=False)
    fa_rb_merged.to_csv('backend/processed_data/fa_rbs.csv', index=False)
    fa_wr_merged.to_csv('backend/processed_data/fa_wrs.csv', index=False)
    fa_te_merged.to_csv('backend/processed_data/fa_tes.csv', index=False)
    print("Saved fa_qbs.csv to processed_data folder.")

if __name__ == "__main__":
    main()
