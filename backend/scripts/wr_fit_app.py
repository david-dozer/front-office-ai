import pandas as pd
import numpy as np
# from scripts.wr_fit import team_df, wr_imputed_scaled, get_top3_scheme_weights_wr, raw_fit_functions_wr, fit_wr_df
from wr_fit import team_df, wr_imputed_scaled, get_top3_scheme_weights_wr, raw_fit_functions_wr, fit_wr_df

def compute_volume_bonus(wr_row):
    """
    Volume bonus (per-game):
      +0.05 if receptions per game ≥ 6
      +0.05 if targets per game ≥ 8
    """
    bonus = 0
    if wr_row['receptions_per_game'] >= 6:
        bonus += 0.05
    if wr_row['targets_per_game'] >= 8:
        bonus += 0.05
    return bonus

def get_wr_fits_for_team(team_name):
    """
    Given an NFL team name, computes the best WR fits using the trained WR model.
    Returns a DataFrame of free agent WRs with final fit scores and ranking columns.
    """
    team_row = team_df[team_df['team_name'].str.contains(team_name, case=False, na=False)]
    if team_row.empty:
        print(f"Error: Team '{team_name}' not found in the dataset.")
        return None
    team_row = team_row.iloc[0]
    
    scheme_weights = get_top3_scheme_weights_wr(team_row)
    
    records = []
    for _, wr_row in wr_imputed_scaled.iterrows():
        wr_name = wr_row['player_name']
        aav = wr_row['AAV']
        prev_team = wr_row['Prev Team']
        age = wr_row['Age']
        headshot = wr_row['headshot_url']
        fit_components = {}
        for scheme, weight in scheme_weights.items():
            if scheme in raw_fit_functions_wr:
                raw_fit = raw_fit_functions_wr[scheme](wr_row)
                fit_components[scheme] = raw_fit
            else:
                fit_components[scheme] = np.nan
        final_fit = sum(scheme_weights[scheme] * fit_components[scheme] for scheme in scheme_weights)
        final_fit += compute_volume_bonus(wr_row)
        records.append({
            'wr_name': wr_name,
            'aav': aav,
            'prev_team': prev_team,
            'age': age,
            'headshot': headshot,
            'final_fit': final_fit
        })
    
    results_df = pd.DataFrame(records).sort_values(by='final_fit', ascending=False)
    
    # --- Compute Advanced & Next Gen Metric Rankings from the Full WR Dataset ---
    # (This replicates the TE code but with WR-specific metrics.)

    # Group by player_name so each receiver appears only once (averaging duplicate entries)
    grouped_full_wr = wr_imputed_scaled.groupby('player_name').agg({
        'scaled_receiving_air_yards': 'mean',
        'scaled_receiving_yards_after_catch': 'mean',
        'scaled_receiving_epa': 'mean',
        'scaled_target_share': 'mean',
        'scaled_receiving_first_downs': 'mean',
        'scaled_racr': 'mean',
        'scaled_air_yards_share': 'mean',
        'scaled_receiving_fumbles': 'mean',
        'scaled_receiving_fumbles_lost': 'mean',
        'scaled_ngs_avg_separation': 'mean',
        'scaled_ngs_avg_intended_air_yards': 'mean',
        'scaled_ngs_catch_percentage': 'mean',
        'scaled_ngs_avg_expected_yac': 'mean',
        'scaled_ngs_percent_share_of_intended_air_yards': 'mean',
        'scaled_ngs_avg_yac_above_expectation': 'mean',
        'scaled_ngs_avg_yac': 'mean'
    }).reset_index()

    # For each metric, create a ranking column (with 1 as the best)
    for col, rank_name in [
        ('scaled_receiving_air_yards', 'receiving_air_yards_rank'),
        ('scaled_receiving_yards_after_catch', 'receiving_yards_after_catch_rank'),
        ('scaled_receiving_epa', 'receiving_epa_rank'),
        ('scaled_target_share', 'target_share_rank'),
        ('scaled_receiving_first_downs', 'receiving_first_downs_rank'),
        ('scaled_racr', 'racr_rank'),
        ('scaled_air_yards_share', 'air_yards_share_rank'),
        ('scaled_receiving_fumbles', 'receiving_fumbles_rank'),
        ('scaled_receiving_fumbles_lost', 'receiving_fumbles_lost_rank'),
        ('scaled_ngs_avg_separation', 'ngs_avg_separation_rank'),
        ('scaled_ngs_avg_intended_air_yards', 'ngs_avg_intended_air_yards_rank'),
        ('scaled_ngs_catch_percentage', 'ngs_catch_percentage_rank'),
        ('scaled_ngs_avg_expected_yac', 'ngs_avg_expected_yac_rank'),
        ('scaled_ngs_percent_share_of_intended_air_yards', 'ngs_percent_share_of_intended_air_yards_rank'),
        ('scaled_ngs_avg_yac_above_expectation', 'ngs_avg_yac_above_expectation_rank'),
        ('scaled_ngs_avg_yac', 'ngs_avg_yac_rank')
    ]:
        grouped_full_wr[rank_name] = grouped_full_wr[col].rank(ascending=False, method='min')

    # Keep only the ranking columns and rename 'player_name' to 'wr_name' for merging
    ranking_wr_df = grouped_full_wr[['player_name',
        'receiving_air_yards_rank',
        'receiving_yards_after_catch_rank',
        'receiving_epa_rank',
        'target_share_rank',
        'receiving_first_downs_rank',
        'racr_rank',
        'air_yards_share_rank',
        'receiving_fumbles_rank',
        'receiving_fumbles_lost_rank',
        'ngs_avg_separation_rank',
        'ngs_avg_intended_air_yards_rank',
        'ngs_catch_percentage_rank',
        'ngs_avg_expected_yac_rank',
        'ngs_percent_share_of_intended_air_yards_rank',
        'ngs_avg_yac_above_expectation_rank',
        'ngs_avg_yac_rank'
    ]]
    ranking_wr_df = ranking_wr_df.rename(columns={'player_name': 'wr_name'})

    # --- Merge the ranking info into your free agent WR fit DataFrame ---
    results_df = results_df.merge(ranking_wr_df, on='wr_name', how='left')
    return results_df

if __name__ == "__main__":
    while True:
        team_name_input = input("Enter an NFL team name (or 'exit' to quit): ")
        if team_name_input.lower() in ['exit', 'e']:
            print("Exiting application...")
            break
        team_fits = get_wr_fits_for_team(team_name_input)
        if team_fits is not None:
            print("\nTop WR Fits for", team_name_input)
            print(team_fits[
                ['wr_name', 'final_fit',
                'receiving_air_yards_rank', 'receiving_yards_after_catch_rank', 'receiving_epa_rank',
                'target_share_rank', 'receiving_first_downs_rank', 'racr_rank', 'air_yards_share_rank',
                'receiving_fumbles_rank', 'receiving_fumbles_lost_rank',
                'ngs_avg_separation_rank', 'ngs_avg_intended_air_yards_rank', 'ngs_catch_percentage_rank',
                'ngs_avg_expected_yac_rank', 'ngs_percent_share_of_intended_air_yards_rank',
                'ngs_avg_yac_above_expectation_rank', 'ngs_avg_yac_rank'
            ]
            ].head(10))
