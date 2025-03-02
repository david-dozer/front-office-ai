import os
import pandas as pd
import nfl_data_py as nfl
from playerscrape import scrape_free_agents, off_url

def get_roster_data(year):
    """
    Retrieve the roster data for the given year and select columns needed:
    'player_name', 'height', 'weight', 'headshot_url'
    """
    df_roster = nfl.import_seasonal_rosters(year)
    roster_columns = ['player_name', 'height', 'weight', 'headshot_url']
    df_roster = df_roster[roster_columns]
    return df_roster

def load_oline_data(filepath):
    """
    Load o_line.csv including Week 1 to Week 18 columns along with key columns.
    """
    weeks = [f"Week {i}" for i in range(1, 19)]
    columns = ['NAME', 'POS', 'TEAM', 'DEPTH', 'Avg', 'TM SNAP %'] + weeks
    df = pd.read_csv(filepath, usecols=columns)
    return df

def add_rankings(df):
    """
    Convert key columns to numeric and add ranking columns.
    For DEPTH, a lower number is better; for Avg and TM SNAP %, higher is better.
    """
    df['DEPTH'] = pd.to_numeric(df['DEPTH'], errors='coerce')
    df['Avg'] = pd.to_numeric(df['Avg'], errors='coerce')
    df['TM SNAP %'] = pd.to_numeric(df['TM SNAP %'], errors='coerce')
    
    df['DEPTH_ranking'] = df['DEPTH'].rank(method='min', ascending=True)
    df['Avg_ranking'] = df['Avg'].rank(method='min', ascending=False)
    df['TM SNAP %_ranking'] = df['TM SNAP %'].rank(method='min', ascending=False)
    
    return df

def compute_rating(df):
    """
    Compute a composite rating based on normalized DEPTH, TM SNAP %, and Avg.
    Also incorporate a games factor by counting non-null Week 1 to Week 18 values.
    """
    # Normalize DEPTH so that lower values are best.
    max_depth = df['DEPTH'].max()
    if max_depth > 1:
        df['depth_score'] = 1 - ((df['DEPTH'] - 1) / (max_depth - 1))
    else:
        df['depth_score'] = 1

    # Normalize TM SNAP %: if values are above 1, assume they're percentages.
    if df['TM SNAP %'].max() > 1:
        df['TM_SNAP'] = df['TM SNAP %'] / 100.0
    else:
        df['TM_SNAP'] = df['TM SNAP %']
    
    # Normalize Avg using min–max normalization.
    min_avg = df['Avg'].min()
    max_avg = df['Avg'].max()
    if max_avg - min_avg > 0:
        df['avg_norm'] = (df['Avg'] - min_avg) / (max_avg - min_avg)
    else:
        df['avg_norm'] = 1

    # Weights for each metric.
    w_depth = 0.4
    w_snap = 0.3
    w_avg = 0.3

    # Compute composite rating.
    df['rating'] = w_depth * df['depth_score'] + w_snap * df['TM_SNAP'] + w_avg * df['avg_norm']
    
    # Count games played (non-null values in Week 1 to Week 18).
    weeks = [f"Week {i}" for i in range(1, 19)]
    df['games'] = df[weeks].count(axis=1)
    
    # Apply games factor: players with fewer games get a lower rating.
    df['rating'] = df['rating'] * (df['games'] / 18)
    
    return df.sort_values(by='rating', ascending=False)

def scale_rating_by_team(df):
    """
    Scale the composite rating per team so that the best player for each team is 1.0.
    """
    df['max_team_rating'] = df.groupby('TEAM')['rating'].transform('max')
    df['team_relative_rating'] = df['rating'] / df['max_team_rating']
    return df

def apply_final_scaling(df):
    """
    Map team_relative_rating from [0, 1] to [0.1, 0.85]:
       final_rating = team_relative_rating * 0.75 + 0.1
    """
    df['final_rating'] = df['team_relative_rating'] * 0.75 + 0.1
    return df

def clean_columns(df):
    """
    Convert all column names to lowercase and remove spaces.
    """
    df.columns = df.columns.str.lower().str.replace(" ", "")
    return df

def main():
    base_path = os.path.join("backend", "processed_data")
    o_line_filepath = os.path.join(base_path, "o_line.csv")
    oline_output_filepath = os.path.join(base_path, "oline_data.csv")
    fa_oline_output_filepath = os.path.join(base_path, "fa_oline.csv")
    
    # 1. Load the o_line data.
    df_oline = load_oline_data(o_line_filepath)
    
    # 2. Add ranking columns.
    df_oline = add_rankings(df_oline)
    
    # 3. Compute the composite rating (with games factor).
    df_oline = compute_rating(df_oline)
    
    # 4. Scale the composite rating by team.
    df_oline = scale_rating_by_team(df_oline)
    
    # 5. Apply final scaling to map ratings from [0,1] to [0.1, 0.85].
    df_oline = apply_final_scaling(df_oline)
    
    # 6. Merge with roster data (2024) to add 'height', 'weight', 'headshot_url'.
    df_roster = get_roster_data([2024])
    df_oline = df_oline.merge(df_roster, left_on='NAME', right_on='player_name', how='left')
    df_oline.drop(columns=['player_name'], inplace=True)
    
    # 7. Sort by final_rating (highest first) and save full linemen data without cleaning columns.
    df_oline = df_oline.sort_values(by='final_rating', ascending=False)
    df_oline.to_csv(oline_output_filepath, index=False)
    print(f"Saved full linemen data with rankings and final ratings to {oline_output_filepath}")
    
    # 8. Scrape free agent linemen.
    free_agents_df = scrape_free_agents(off_url)
    
    # 9. Merge free agent data with the full linemen data.
    # Assuming free_agents_df uses the same key "name" (case-sensitive match).
    df_fa = df_oline.merge(free_agents_df, left_on='NAME', right_on='Name', how='inner')
    
    # 10. Sort free agent data by final_rating (highest first) and clean columns.
    df_fa = df_fa.sort_values(by='final_rating', ascending=False)

    if 'Name' in df_fa.columns:
        df_fa = df_fa.drop(columns=['Name'])
    
    df_fa = clean_columns(df_fa)
    df_fa.to_csv(fa_oline_output_filepath, index=False)
    print(f"Saved free agent linemen data with final ratings to {fa_oline_output_filepath}")

if __name__ == '__main__':
    main()
