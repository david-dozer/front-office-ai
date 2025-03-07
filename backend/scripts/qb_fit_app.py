import pandas as pd
import numpy as np
from scripts.qb_fit import (
    team_df, qb_imputed_scaled, get_top3_scheme_weights_qb, raw_fit_functions_qb,
    compute_final_fit_qb, compute_team_need_bonus, compute_full_qb_rankings, compute_rushing_bonus_qb
)

def get_qb_fits_for_team(team_name):
    """
    Given an NFL team name, computes the best QB fits using the trained model.

    Parameters:
    - team_name (str): The full team name (e.g., "New York Jets")

    Returns:
    - A sorted DataFrame with QB names and their fit scores for the specified team.
    """
    # Find the team in team_df
    team_row = team_df[team_df['team_name'].str.contains(team_name, case=False, na=False)]

    if team_row.empty:
        print(f"Error: Team '{team_name}' not found in the dataset.")
        return None

    team_row = team_row.iloc[0]  # Take the first matching row

    # Get the team's top 3 scheme weights
    scheme_weights = get_top3_scheme_weights_qb(team_row)

    # Compute raw fit scores for each QB
    records = []
    for _, qb_row in qb_imputed_scaled.iterrows():
        qb_name = qb_row['player_name']
        qb_id = qb_row['player_id']
        completed_air_yards = qb_row['passing_yards']
        aav = qb_row.get('market_value', qb_row.get('AAV'))
        prev_team = qb_row['Prev Team']
        age = qb_row['Age']
        games = qb_row['games']
        headshot = qb_row['headshot_url']

        # Compute base final fit (without need bonus)
        base_fit = compute_final_fit_qb(qb_row, scheme_weights, raw_fit_functions_qb)
        team_need_bonus = compute_team_need_bonus(team_row)
        # Add bonus for QB mobility (for applicable schemes)
        mobility_schemes = ['spread_option', 'pistol_power_spread']
        if any(scheme in scheme_weights for scheme in mobility_schemes):
            base_fit += compute_rushing_bonus_qb(qb_row)
        # Apply the team need bonus in the app
        final_fit = base_fit + team_need_bonus
        if age > 35:
            final_fit -= 0.05
        final_fit = max(final_fit, np.random.uniform(0, 0.2))  
        # Ensure the final score isn't negative and add a random number from 0 to 0.2.

        # Store results
        records.append({
            'qb_name': qb_name,
            'qb_id': qb_id,
            'completed_air_yards': completed_air_yards,
            'aav': aav,
            'prev_team': prev_team,
            'age': age,
            'games': games,
            'headshot': headshot, 
            'final_fit': final_fit
        })

    # Convert to DataFrame and sort by best fit
    results_df = pd.DataFrame(records).sort_values(by='final_fit', ascending=False)
    # Merge in the full QB ranking information.
    ranking_qb_df = compute_full_qb_rankings()
    # Add completed air yards to results df
    results_df['completed_air_yards'] = results_df['qb_name'].map(qb_imputed_scaled.set_index('player_name')['passing_yards'])
    results_df = results_df.merge(ranking_qb_df, left_on='qb_name', right_on='player_name', how='left').drop(columns=['player_name'])

    return results_df

# === Run the script ===
if __name__ == "__main__":
    while True:
        team_name_input = input("Enter an NFL team name: ")
        team_fits = get_qb_fits_for_team(team_name_input)

        if team_fits is not None:
            print("\nTop QB Fits for", team_name_input)
            print(team_fits[['qb_name', 'final_fit']].head(10))  # Show top 10 QB fits
