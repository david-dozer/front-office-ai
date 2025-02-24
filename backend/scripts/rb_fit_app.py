import pandas as pd
import numpy as np
from scripts.rb_fit import team_df, rb_imputed_scaled, get_top3_scheme_weights_rb, raw_fit_functions_rb

def get_rb_fits_for_team(team_name):
    """
    Given an NFL team name, computes the best RB fits using the trained RB model.
    
    Parameters:
      team_name (str): The full team name (e.g., "New England Patriots")
    
    Returns:
      A sorted DataFrame with RB names and their fit scores for the specified team.
    """
    # Find the team row in the team stats DataFrame
    team_row = team_df[team_df['team_name'].str.contains(team_name, case=False, na=False)]
    
    if team_row.empty:
        print(f"Error: Team '{team_name}' not found in the dataset.")
        return None

    team_row = team_row.iloc[0]  # Use the first matching row

    # Get the team's top 3 scheme weights based on their offensive tendencies
    scheme_weights = get_top3_scheme_weights_rb(team_row)

    records = []
    # Iterate through each RB in the preprocessed RB DataFrame
    for _, rb_row in rb_imputed_scaled.iterrows():
        rb_name = rb_row['player_name']
        fit_components = {}

        # Compute raw fit for each of the team's top 3 schemes
        for scheme, weight in scheme_weights.items():
            if scheme in raw_fit_functions_rb:
                raw_fit = raw_fit_functions_rb[scheme](rb_row)
                fit_components[scheme] = raw_fit
            else:
                fit_components[scheme] = np.nan

        # Calculate the final weighted fit score for this RB
        final_fit = sum(scheme_weights[scheme] * fit_components[scheme] for scheme in scheme_weights)

        # Bonus for players with high raw yards per carry (ypc > 4.2)
        if rb_row['yards_per_carry'] > 4.2:
            final_fit += 0.05  # Additional bonus for efficient rushers

        records.append({
            'rb_name': rb_name,
            'final_fit': final_fit
        })

    # Convert records to a DataFrame and sort by final fit score in descending order
    results_df = pd.DataFrame(records).sort_values(by='final_fit', ascending=False)

    return results_df

# === Run the application ===
if __name__ == "__main__":
    while True:
        team_name_input = input("Enter an NFL team name (or 'exit'/'e' to quit): ")
        
        if team_name_input.lower() in ['exit', 'e']:
            print("Exiting application...")
            break
            
        team_fits = get_rb_fits_for_team(team_name_input)
        
        if team_fits is not None:
            print("\nTop RB Fits for", team_name_input)
            print(team_fits[['rb_name', 'final_fit']].head(10))  # Display top 10 RB fits
