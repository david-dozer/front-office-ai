import pandas as pd
import numpy as np
from scripts.wr_fit import team_df, wr_imputed_scaled, get_top3_scheme_weights_wr, raw_fit_functions_wr, compute_final_fit_wr, compute_full_wr_rankings

def compute_team_need_bonus_wr(team_row):
    """
    Computes a team need bonus for wide receivers using passing ranking columns.
    
    Uses columns:
      - PassingYds_Rank
      - PassingTD_Rank
      - Passing1stD_Rank
      
    Since wide receivers are critical to passing production, if a team is inside
    the top 8 (i.e. average rank < 8), a penalty is applied.
    
    Tiers for average rank (avg_rank):
      • avg_rank ≥ 28: +0.06 bonus
      • 22 ≤ avg_rank < 28: +0.05 bonus
      • 17 ≤ avg_rank < 22: +0.04 bonus
      • 8 ≤ avg_rank < 17: +0.03 bonus
      • avg_rank < 8: –0.2 bonus
    """
    ranking_cols = ['PassingYds_Rank', 'PassingTD_Rank', 'Passing1stD_Rank']
    avg_rank = team_row[ranking_cols].mean()
    
    if avg_rank < 8:
        bonus = -0.1
    elif 8 <= avg_rank < 17:
        bonus = 0.03
    elif 17 <= avg_rank < 22:
        bonus = 0.05
    elif 22 <= avg_rank < 28:
        bonus = 0.06
    else:
        bonus = 0.075
    return bonus

def get_wr_fits_for_team(team_name):
    """
    Given an NFL team name, computes the best WR fits using the unified final fit function.
    Returns a DataFrame with free agent WRs' final fit scores (including bonuses) and full ranking columns.
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
        wr_id = wr_row['player_id']
        aav = wr_row.get('market_value', wr_row.get('AAV'))
        prev_team = wr_row['Prev Team']
        age = wr_row['Age']
        games = wr_row['games']
        headshot = wr_row['headshot_url']
        # Use the unified function to compute final fit (with bonuses)
        final_fit = compute_final_fit_wr(wr_row, scheme_weights, raw_fit_functions_wr)
        final_fit += compute_team_need_bonus_wr(team_row)
        if age > 29:
            final_fit -= (age - 31) * 0.04
        records.append({
            'wr_name': wr_name,
            'wr_id': wr_id,
            'aav': aav,
            'prev_team': prev_team,
            'age': age,
            'games': games,
            'headshot': headshot,
            'final_fit': final_fit
        })
    results_df = pd.DataFrame(records).sort_values(by='final_fit', ascending=False)
    
    # Merge in full ranking info
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
        if team_fits is not None:
            print("\nTop WR Fits for", team_name_input)
            print(team_fits[['wr_name', 'final_fit']].head(10))
