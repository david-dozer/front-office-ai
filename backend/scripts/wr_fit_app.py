import pandas as pd
import numpy as np
from scripts.wr_fit import team_df, wr_imputed_scaled, get_top3_scheme_weights_wr, raw_fit_functions_wr, compute_full_wr_rankings

def compute_volume_bonus(wr_row):
    bonus = 0
    if wr_row['receptions_per_game'] >= 6:
        bonus += 0.05
    if wr_row['targets_per_game'] >= 8:
        bonus += 0.05
    return bonus

def get_wr_fits_for_team(team_name):
    """
    Given an NFL team name, computes the best WR fits using the trained WR model.
    Returns a DataFrame of free agent WRs with final fit scores and full advanced metric rankings.
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
        games = wr_row['games']
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
        if games < 9:
            final_fit -= 0.1
        if wr_name in ["Dyami Brown", "DeAndre Hopkins", "Stefon Diggs", "Keenan Allen"]:
            final_fit += 0.1
        records.append({
            'wr_name': wr_name,
            'aav': aav,
            'prev_team': prev_team,
            'age': age,
            'games': games,
            'headshot': headshot,
            'final_fit': final_fit
        })
    results_df = pd.DataFrame(records).sort_values(by='final_fit', ascending=False)
    
    # Merge full rankings using the refactored function
    ranking_wr_df = compute_full_wr_rankings()
    results_df = results_df.merge(ranking_wr_df, left_on='wr_name', right_on='player_name', how='left').drop(columns=['player_name'])
    return results_df

if __name__ == "__main__":
    while True:
        team_name_input = input("Enter an NFL team name (or 'exit' to quit): ")
        if team_name_input.lower() in ['exit', 'e']:
            print("Exiting application...")
            break
        team_fits = get_wr_fits_for_team(team_name_input)
        team_fits.to_csv('../backend/scripts/wr_fit_data.csv', index=False)
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
