import pandas as pd
import numpy as np
from scripts.te_fit import team_df, fa_te_imputed_scaled, get_top3_scheme_weights_te, raw_fit_functions_te, fit_te_df, full_te_imputed_scaled

def compute_team_need_te(team_row):
    """
    Computes a team need bonus for tight ends (TEs) using passing ranking columns.
    
    Uses columns:
      - PassingYds_Rank
      - PassingTD_Rank
      - Passing1stD_Rank
      
    The bonus is scaled such that teams with poorer TE production (avg_rank >= 16) receive
    a small positive bonus (+0.02), while teams with elite TE production are penalized:
      • For avg_rank between 15 and 10: a slight penalty (-0.05)
      • For avg_rank between 9 and 5: a moderate penalty (-0.1)
      • For avg_rank between 4 and 1: a heavy penalty (-0.2)
    """
    ranking_cols = ['PassingYds_Rank', 'PassingTD_Rank', 'Passing1stD_Rank']
    avg_rank = team_row[ranking_cols].mean()
    
    if avg_rank >= 16:
        bonus = 0.02
    elif 10 <= avg_rank < 16:
        bonus = -0.05
    elif 5 <= avg_rank < 10:
        bonus = -0.1
    else:  # avg_rank < 5
        bonus = -0.2
    return bonus

def get_te_fits_for_team(team_name):
    """
    Given an NFL team name, computes the best TE fits using the trained TE model.
    
    Parameters:
      team_name (str): The full team name (e.g., "New England Patriots")
    
    Returns:
      A sorted DataFrame with TE names, fit scores, and advanced metric rankings for the specified team.
    """
    # Find the team row in the team stats DataFrame
    team_row = team_df[team_df['team_name'].str.contains(team_name, case=False, na=False)]
    
    if team_row.empty:
        print(f"Error: Team '{team_name}' not found in the dataset.")
        return None

    team_row = team_row.iloc[0]  # Use the first matching row

    # Get the team's top 3 scheme weights based on their offensive tendencies
    scheme_weights = get_top3_scheme_weights_te(team_row)

    records = []
    # Iterate through each TE in the free agent TE DataFrame (fa_tes)
    for _, te_row in fa_te_imputed_scaled.iterrows():
        te_name = te_row['player_name']
        te_id = te_row['player_id']
        aav = te_row.get('market_value', te_row.get('AAV'))
        prev_team = te_row['Prev Team'] if 'Prev Team' in te_row else np.nan
        age = te_row['Age']
        headshot = te_row['headshot_url'] if 'headshot_url' in te_row else ''
        fit_components = {}

        # Compute raw fit for each of the team's top 3 schemes
        for scheme, weight in scheme_weights.items():
            if scheme in raw_fit_functions_te:
                raw_fit = raw_fit_functions_te[scheme](te_row)
                fit_components[scheme] = raw_fit
            else:
                fit_components[scheme] = np.nan

        # Calculate the final weighted fit score for this TE
        final_fit = sum(scheme_weights[scheme] * fit_components[scheme] for scheme in scheme_weights)
        final_fit += compute_team_need_te(team_row)
        if age > 33:
            final_fit -= (age - 33) * 0.02
        records.append({
            'te_name': te_name,
            'te_id': te_id,
            'aav': aav,
            'prev_team': prev_team,
            'age': age,
            'headshot': headshot, 
            'final_fit': final_fit
        })

    # Convert records to a DataFrame and sort by final fit score in descending order
    results_df = pd.DataFrame(records).sort_values(by='final_fit', ascending=False)

    # === Compute Advanced Metric Rankings from the Full TE Dataset ===
    # Group by player_name so that each player appears only once (taking the mean for duplicates)
    grouped_full_te = full_te_imputed_scaled.groupby('player_name').agg({
        'scaled_receiving_epa': 'mean',
        'scaled_receiving_first_downs_per_game': 'mean',
        'scaled_ngs_catch_percentage': 'mean',
        'scaled_ngs_avg_yac': 'mean',
        'scaled_ngs_avg_separation': 'mean'
    }).reset_index()

    # For each metric, create a ranking column (with 1 as the best, i.e., highest value)
    for col, rank_name in [
        ('scaled_receiving_epa', 'adv_receiving_epa_rank'),
        ('scaled_receiving_first_downs_per_game', 'adv_receiving_first_downs_rank'),
        ('scaled_ngs_catch_percentage', 'adv_ngs_catch_percentage_rank'),
        ('scaled_ngs_avg_yac', 'adv_ngs_avg_yac_rank'),
        ('scaled_ngs_avg_separation', 'adv_ngs_avg_separation_rank')
    ]:
        grouped_full_te[rank_name] = grouped_full_te[col].rank(ascending=False, method='min')

    # Keep only the ranking columns and rename 'player_name' to 'te_name' for merging
    ranking_df = grouped_full_te[['player_name', 'adv_receiving_epa_rank', 'adv_receiving_first_downs_rank', 
                                  'adv_ngs_catch_percentage_rank', 'adv_ngs_avg_yac_rank', 'adv_ngs_avg_separation_rank']]
    ranking_df = ranking_df.rename(columns={'player_name': 'te_name'})

    # Merge the ranking info into our free agent TE fit dataset based on te_name
    results_df = results_df.merge(ranking_df, on='te_name', how='left')

    return results_df

# === Run the application ===
if __name__ == "__main__":
    while True:
        team_name_input = input("Enter an NFL team name (or 'exit'/'e' to quit): ")
        
        if team_name_input.lower() in ['exit', 'e']:
            print("Exiting application...")
            break
            
        team_fits = get_te_fits_for_team(team_name_input)
        
        if team_fits is not None:
            print("\nTop TE Fits for", team_name_input)
            print(team_fits[[
                'te_name', 'final_fit', 'adv_receiving_epa_rank', 'adv_receiving_first_downs_rank', 
                'adv_ngs_catch_percentage_rank', 'adv_ngs_avg_yac_rank', 'adv_ngs_avg_separation_rank'
            ]].head(10))
