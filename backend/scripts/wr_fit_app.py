import pandas as pd
import numpy as np
from scripts.wr_fit import team_df, wr_imputed_scaled, get_top3_scheme_weights_wr, raw_fit_functions_wr, compute_volume_bonus

def get_wr_fits_for_team(team_name):
    """
    Given an NFL team name, computes the best WR fits using the trained WR model.
    
    Parameters:
      team_name (str): The full team name (e.g., "New England Patriots")
    
    Returns:
      A sorted DataFrame with WR names and their fit scores for the specified team.
    """
    # Find the team row in the team stats DataFrame
    team_row = team_df[team_df['team_name'].str.contains(team_name, case=False, na=False)]
    
    if team_row.empty:
        print(f"Error: Team '{team_name}' not found in the dataset.")
        return None

    team_row = team_row.iloc[0]  # Use the first matching row

    # Get the team's top 3 scheme weights based on their offensive tendencies
    scheme_weights = get_top3_scheme_weights_wr(team_row)

    records = []
    # Iterate through each WR in the preprocessed WR DataFrame
    for _, wr_row in wr_imputed_scaled.iterrows():
        wr_name = wr_row['player_name']
        aav = wr_row['AAV']
        prev_team = wr_row['Prev Team']
        age = wr_row['Age']
        fit_components = {}

        # Compute raw fit for each of the team's top 3 schemes
        for scheme, weight in scheme_weights.items():
            if scheme in raw_fit_functions_wr:
                raw_fit = raw_fit_functions_wr[scheme](wr_row)
                fit_components[scheme] = raw_fit
            else:
                fit_components[scheme] = np.nan

        # Calculate the final weighted fit score for this WR
        final_fit = sum(scheme_weights[scheme] * fit_components[scheme] for scheme in scheme_weights)

        # Add volume bonus based on per-game receptions and targets
        final_fit += compute_volume_bonus(wr_row)

        # Add bonus for Deandre Hopkins
        if wr_name.lower() == 'deandre hopkins' or wr_name.lower() == 'dyami brown':
            final_fit += 0.075

        records.append({
            'wr_name': wr_name,
            'aav': aav,
            'prev_team': prev_team,
            'age': age, 
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
            
        team_fits = get_wr_fits_for_team(team_name_input)
        
        if team_fits is not None:
            print("\nTop WR Fits for", team_name_input)
            print(team_fits[['wr_name', 'final_fit']].head(10))  # Display top 10 WR fits
