import pandas as pd
import numpy as np
from scripts.rb_fit import team_df, rb_imputed_scaled, get_top3_scheme_weights_rb, raw_fit_functions_rb, compute_full_rb_rankings, compute_final_fit_rb

def compute_team_need_bonus_rb(team_row):
    """
    Computes a team need bonus for running backs using rushing ranking columns.
    
    Uses columns:
      - RushingYds_Rank
      - RushingTD_Rank
      - Y/A_Rank
      
    There are no excluded teams for RBs.
    
    The bonus is based on the average of these ranking columns.
    Lower rankings indicate better performance. Thus, if a team is excelling in rushing 
    (avg_rank < 15), it receives a penalty (-0.2 bonus) because it doesn't need RB help.
    Conversely, if the average rank is high (poor rushing production), the team gets a positive bonus.
    
    Tiers:
      • avg_rank ≥ 28: +0.06 bonus
      • 22 ≤ avg_rank < 28: +0.05 bonus
      • 17 ≤ avg_rank < 22: +0.04 bonus
      • 15 ≤ avg_rank < 17: +0.03 bonus
      • avg_rank < 15: -0.2 bonus
    """
    ranking_cols = ['RushingYds_Rank', 'RushingTD_Rank', 'Y/A_Rank']
    avg_rank = team_row[ranking_cols].mean()
    
    if avg_rank >= 28:
        bonus = 0.06
    elif 22 <= avg_rank < 28:
        bonus = 0.05
    elif 17 <= avg_rank < 22:
        bonus = 0.04
    elif 15 <= avg_rank < 17:
        bonus = 0.03
    else:
        bonus = -0.2
    return bonus

def get_rb_fits_for_team(team_name):
    """
    Computes the RB fits for a given team, using the unified final fit function
    and merging full RB ranking data.
    """
    team_row = team_df[team_df['team_name'].str.contains(team_name, case=False, na=False)]
    if team_row.empty:
        print(f"Error: Team '{team_name}' not found in the dataset.")
        return None
    team_row = team_row.iloc[0]
    scheme_weights = get_top3_scheme_weights_rb(team_row)
    records = []
    for _, rb_row in rb_imputed_scaled.iterrows():
        rb_name = rb_row['player_name']
        rb_id = rb_row['player_id']
        aav = rb_row.get('market_value', rb_row.get('AAV'))
        prev_team = rb_row['Prev Team']
        age = rb_row['Age']
        games = rb_row['games']
        headshot = rb_row['headshot_url']
        final_fit = compute_final_fit_rb(rb_row, scheme_weights, raw_fit_functions_rb)
        final_fit += compute_team_need_bonus_rb(team_row)
        if age > 30:
            final_fit -= (age - 30) * 0.02
        records.append({
            'rb_name': rb_name,
            'rb_id': rb_id,
            'aav': aav,
            'prev_team': prev_team,
            'age': age,
            'games': games,
            'headshot': headshot,
            'final_fit': final_fit
        })
    results_df = pd.DataFrame(records).sort_values(by='final_fit', ascending=False)
    
    # Merge full RB rankings.
    ranking_rb_df = compute_full_rb_rankings()
    results_df = results_df.merge(ranking_rb_df, left_on='rb_name', right_on='player_name', how='left').drop(columns=['player_name'])
    return results_df

if __name__ == "__main__":
    while True:
        team_name_input = input("Enter an NFL team name (or 'exit'/'e' to quit): ")
        if team_name_input.lower() in ['exit', 'e']:
            print("Exiting application...")
            break
        team_fits = get_rb_fits_for_team(team_name_input)
        if team_fits is not None:
            print("\nTop RB Fits for", team_name_input)
            print(team_fits[['rb_name', 'final_fit']].head(10))
