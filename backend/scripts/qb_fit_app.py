import pandas as pd
import numpy as np
from scripts.qb_fit import team_df, qb_imputed_scaled, pipeline, get_top3_scheme_weights_for_model, raw_fit_functions

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
    scheme_weights = get_top3_scheme_weights_for_model(team_row)

    # Compute raw fit scores for each QB
    records = []
    for _, qb_row in qb_imputed_scaled.iterrows():
        qb_name = qb_row['player_name']
        aav = qb_row['AAV']
        prev_team = qb_row['Prev Team']
        age = qb_row['Age']
        headshot = qb_row['headshot_url']
        fit_components = {}

        # Compute raw fit for each of the team's top 3 schemes
        for scheme, weight in scheme_weights.items():
            if scheme in raw_fit_functions:
                raw_fit = raw_fit_functions[scheme](qb_row)
                fit_components[scheme] = raw_fit
            else:
                fit_components[scheme] = np.nan

        # Compute final weighted fit score
        final_fit = sum(scheme_weights[scheme] * fit_components[scheme] for scheme in scheme_weights)

        # Store results
        records.append({
            'qb_name': qb_name,
            'aav': aav,
            'prev_team': prev_team,
            'age': age,
            'headshot': headshot, 
            'final_fit': final_fit
        })

    # Convert to DataFrame and sort by best fit
    results_df = pd.DataFrame(records).sort_values(by='final_fit', ascending=False)

    return results_df

# === Run the script ===
if __name__ == "__main__":
    while True:
        team_name_input = input("Enter an NFL team name: ")
        team_fits = get_qb_fits_for_team(team_name_input)

        if team_fits is not None:
            print("\nTop QB Fits for", team_name_input)
            print(team_fits[['qb_name', 'final_fit']].head(10))  # Show top 10 QB fits
