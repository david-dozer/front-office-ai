import pandas as pd
from playerscrape import scrape_free_agents, off_url

def load_oline_data(filepath):
    # Include Week 1 to Week 18 columns along with key columns.
    weeks = [f"Week {i}" for i in range(1, 19)]
    columns = ['NAME', 'POS', 'TEAM', 'DEPTH', 'Avg', 'TM SNAP %'] + weeks
    df = pd.read_csv(filepath, usecols=columns)
    return df

def add_rankings(df):
    # Convert key columns to numeric.
    df['DEPTH'] = pd.to_numeric(df['DEPTH'], errors='coerce')
    df['Avg'] = pd.to_numeric(df['Avg'], errors='coerce')
    df['TM SNAP %'] = pd.to_numeric(df['TM SNAP %'], errors='coerce')
    
    # Create ranking columns:
    # For DEPTH, lower is better.
    df['DEPTH_ranking'] = df['DEPTH'].rank(method='min', ascending=True)
    # For Avg and TM SNAP %, higher is better.
    df['Avg_ranking'] = df['Avg'].rank(method='min', ascending=False)
    df['TM SNAP %_ranking'] = df['TM SNAP %'].rank(method='min', ascending=False)
    
    return df

def compute_rating(df):
    # Normalize DEPTH so that lower values are better.
    max_depth = df['DEPTH'].max()
    if max_depth > 1:
        df['depth_score'] = 1 - ((df['DEPTH'] - 1) / (max_depth - 1))
    else:
        df['depth_score'] = 1

    # Normalize TM SNAP %: if values are above 1, assume percentages and convert.
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

    # Define weights for the composite rating.
    w_depth = 0.4
    w_snap = 0.3
    w_avg = 0.3

    # Compute the composite rating.
    df['rating'] = w_depth * df['depth_score'] + w_snap * df['TM_SNAP'] + w_avg * df['avg_norm']
    
    # Count games played: count non-null values from Week 1 to Week 18.
    weeks = [f"Week {i}" for i in range(1, 19)]
    df['games'] = df[weeks].count(axis=1)
    
    # Incorporate games factor: multiply by (games/18) so players with fewer games get a lower rating.
    df['rating'] = df['rating'] * (df['games'] / 18)
    
    return df.sort_values(by='rating', ascending=False)

def scale_rating_by_team(df):
    # For each team, scale the composite rating so that the best player on each team gets a rating of 1.0.
    df['max_team_rating'] = df.groupby('TEAM')['rating'].transform('max')
    df['team_relative_rating'] = df['rating'] / df['max_team_rating']
    return df

def apply_final_scaling(df):
    # Map team_relative_rating (0 to 1) to the range 0.1 to 0.85.
    df['final_rating'] = df['team_relative_rating'] * 0.75 + 0.1
    return df

def main():
    # File paths.
    o_line_filepath = 'backend/processed_data/o_line.csv'
    oline_output_filepath = 'backend/processed_data/oline_data.csv'
    fa_oline_output_filepath = 'backend/processed_data/fa_oline.csv'
    
    # 1. Load the o_line data.
    df_oline = load_oline_data(o_line_filepath)
    
    # 2. Add ranking columns (for all linemen).
    df_oline = add_rankings(df_oline)
    
    # 3. Compute the composite rating (incorporating the games factor).
    df_oline = compute_rating(df_oline)
    
    # 4. Scale the composite rating on a per-team basis.
    df_oline = scale_rating_by_team(df_oline)
    
    # 5. Scale the team_relative_rating to a final_rating between 0.1 and 0.85.
    df_oline = apply_final_scaling(df_oline)
    
    # 6. Sort the full dataset by final_rating (highest first) and save it.
    df_oline = df_oline.sort_values(by='final_rating', ascending=False)
    df_oline.to_csv(oline_output_filepath, index=False)
    print(f"Saved full linemen data with rankings and final ratings to {oline_output_filepath}")
    
    # 7. Scrape free agent linemen.
    free_agents_df = scrape_free_agents(off_url)
    
    # 8. Merge free agent data with the full linemen data (using similar logic to your QB example).
    # Merge on o_line "NAME" and free agents "Name".
    df_fa = df_oline.merge(free_agents_df, left_on='NAME', right_on='Name', how='inner')
    
    # 9. Sort the free agent data by final_rating (highest first) and save it.
    df_fa = df_fa.sort_values(by='final_rating', ascending=False)
    df_fa.to_csv(fa_oline_output_filepath, index=False)
    print(f"Saved free agent linemen data with final ratings to {fa_oline_output_filepath}")

if __name__ == '__main__':
    main()
