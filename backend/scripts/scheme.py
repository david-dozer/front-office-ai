import pandas as pd
import numpy as np

def apply_offensive_scheme():
    """
    Apply offensive scheme analysis by processing seasonal and weekly stats,
    computing scheme scores, and saving the results.
    """
    # --- Step 1: Load Data ---
    seasonal_df = pd.read_csv("backend/processed_data/team_seasonal_stats.csv")
    seasonal_df = seasonal_df[seasonal_df['posteam'] != "LGAVG"]

    weekly_df = pd.read_csv("backend/processed_data/team_weekly_stats.csv")

    # --- Step 2: Aggregate Weekly Data ---
    weekly_agg = weekly_df.groupby("posteam").mean().reset_index()

    # Merge seasonal and aggregated weekly data; suffix '_weekly' distinguishes weekly metrics
    data = pd.merge(seasonal_df, weekly_agg, on="posteam", suffixes=("", "_weekly"))

    # --- Step 3: Define Helper Functions ---
    def combined_metric(seasonal_value, weekly_value, alpha=0.2):
        """
        Combine a seasonal value with a weekly average.
        alpha: weight for the seasonal value (default 0.5 means equal weight).
        < 0.5 means weekly data matters more, > 0.5 means seasonal num matters more
        """
        return alpha * seasonal_value + (1 - alpha) * weekly_value

    def score_feature(value, target, tolerance):
        """
        Returns a score between 0 and 1 that linearly decreases as the absolute difference 
        from the target increases. If the deviation exceeds the tolerance, returns 0.
        """
        return max(0, 1 - abs(value - target) / tolerance)

    # --- Step 4: Define Scoring Functions for Each Scheme ---
    def score_mcvay(team_stats):
        score = 0
        combined_shotgun = combined_metric(team_stats['shotgun_freq'], team_stats['shotgun_freq_weekly'], alpha=0.5)
        score += score_feature(combined_shotgun, 0.62, 0.1) * 0.3
        score += score_feature(team_stats['pass_to_run'], 0.60, 0.1) * 0.3
        combined_no_huddle = combined_metric(team_stats['no_huddle_freq'], team_stats['no_huddle_freq_weekly'], alpha=0.5)
        score += score_feature(combined_no_huddle, 0.10, 0.05) * 0.2
        score += score_feature(team_stats.get('outside_run_pct', 0), 0.35, 0.1) * 0.2
        return score

    def score_air_raid(team_stats):
        score = 0
        combined_shotgun = combined_metric(team_stats['shotgun_freq'], team_stats['shotgun_freq_weekly'], alpha=0.5)
        score += score_feature(combined_shotgun, 0.75, 0.1) * 0.3
        combined_no_huddle = combined_metric(team_stats['no_huddle_freq'], team_stats['no_huddle_freq_weekly'], alpha=0.5)
        score += score_feature(combined_no_huddle, 0.30, 0.1) * 0.3
        deep = team_stats['deep_passes_freq'] if team_stats['deep_passes_freq'] > 0 else 0.001
        short_deep_ratio = team_stats['short_passes_freq'] / deep
        score += score_feature(short_deep_ratio, 4.5, 1.0) * 0.2
        score += score_feature(team_stats['pass_to_run'], 0.70, 0.1) * 0.2
        return score

    def score_spread_option(team_stats):
        score = 0
        score += score_feature(team_stats['pass_to_run'], 0.50, 0.1) * 0.3
        combined_shotgun = combined_metric(team_stats['shotgun_freq'], team_stats['shotgun_freq_weekly'], alpha=0.5)
        score += score_feature(combined_shotgun, 0.80, 0.1) * 0.3
        score += score_feature(team_stats['first_down_rush_pct'], 0.78, 0.1) * 0.2
        combined_no_huddle = combined_metric(team_stats['no_huddle_freq'], team_stats['no_huddle_freq_weekly'], alpha=0.5)
        score += score_feature(combined_no_huddle, 0.24, 0.05) * 0.2
        return score

    def score_west_coast(team_stats):
        score = 0
        score += score_feature(team_stats['pass_to_run'], 0.55, 0.1) * 0.3
        combined_shotgun = combined_metric(team_stats['shotgun_freq'], team_stats['shotgun_freq_weekly'], alpha=0.5)
        score += score_feature(combined_shotgun, 0.70, 0.1) * 0.3
        combined_no_huddle = combined_metric(team_stats['no_huddle_freq'], team_stats['no_huddle_freq_weekly'], alpha=0.5)
        score += score_feature(combined_no_huddle, 0.09, 0.05) * 0.2
        score += score_feature(team_stats['yac'], 6.25, 0.5) * 0.2
        return score

    def score_run_power(team_stats):
        score = 0
        score += score_feature(team_stats['pass_to_run'], 0.55, 0.1) * 0.3
        combined_shotgun = combined_metric(team_stats['shotgun_freq'], team_stats['shotgun_freq_weekly'], alpha=0.5)
        score += score_feature(combined_shotgun, 0.55, 0.1) * 0.3
        score += score_feature(team_stats.get('inside_run_pct', 0), 0.75, 0.1) * 0.2
        score += score_feature(team_stats.get('outside_run_pct', 0), 0.25, 0.05) * 0.2
        return score

    def score_pistol_power_spread(team_stats):
        score = 0
        score += score_feature(team_stats['pass_to_run'], 0.65, 0.1) * 0.3
        combined_shotgun = combined_metric(team_stats['shotgun_freq'], team_stats['shotgun_freq_weekly'], alpha=0.5)
        score += score_feature(combined_shotgun, 0.68, 0.1) * 0.3
        combined_no_huddle = combined_metric(team_stats['no_huddle_freq'], team_stats['no_huddle_freq_weekly'], alpha=0.5)
        score += score_feature(combined_no_huddle, 0.13, 0.05) * 0.2
        score += score_feature(team_stats.get('inside_run_pct', 0), 0.82, 0.05) * 0.2
        return score

    def score_shanahan(team_stats):
        score = 0
        score += score_feature(team_stats['pass_to_run'], 0.55, 0.1) * 0.3
        combined_shotgun = combined_metric(team_stats['shotgun_freq'], team_stats['shotgun_freq_weekly'], alpha=0.5)
        score += score_feature(combined_shotgun, 0.58, 0.1) * 0.3
        combined_no_huddle = combined_metric(team_stats['no_huddle_freq'], team_stats['no_huddle_freq_weekly'], alpha=0.5)
        score += score_feature(combined_no_huddle, 0.03, 0.02) * 0.2
        score += score_feature(team_stats.get('inside_run_pct', 0), 0.70, 0.05) * 0.1
        score += score_feature(team_stats.get('outside_run_pct', 0), 0.29, 0.05) * 0.1
        return score

    def compute_scheme_scores(team_stats):
        scores = {
            'West Coast McVay': score_mcvay(team_stats),
            'Air Raid': score_air_raid(team_stats),
            'Spread Option': score_spread_option(team_stats),
            'West Coast': score_west_coast(team_stats),
            'Run Power': score_run_power(team_stats),
            'Pistol Power Spread': score_pistol_power_spread(team_stats),
            'Shanahan Wide Zone': score_shanahan(team_stats)
        }
        return scores

    # --- Step 5: Compute Scheme Scores and Classify Teams ---
    data['scheme_scores'] = data.apply(lambda row: compute_scheme_scores(row), axis=1)

    for scheme in ['West Coast McVay', 'Air Raid', 'Spread Option', 'West Coast', 
                   'Run Power', 'Pistol Power Spread', 'Shanahan Wide Zone']:
        data[f'score_{scheme.lower().replace(" ", "_")}'] = data['scheme_scores'].apply(lambda x: x[scheme])

    data['predicted_scheme'] = data['scheme_scores'].apply(lambda scores: max(scores, key=scores.get))

    # Load team seasonal stats again to add scheme information
    team_stats_df = pd.read_csv('backend/processed_data/team_seasonal_stats.csv')
    team_scheme_dict = data[['posteam', 'predicted_scheme']].set_index('posteam')['predicted_scheme'].to_dict()

    team_stats_df['scheme'] = team_stats_df['posteam'].map(team_scheme_dict)

    score_columns = [col for col in data.columns if col.startswith('score_')]
    for col in score_columns:
        team_stats_df[col] = data[col]

    # --- Step 5.1: Assign Specific Teams to Schemes ---
    team_scheme_mapping = {
        'WAS': 'Air Raid',
        'MIA': 'Shanahan Wide Zone',
        'LA': 'West Coast McVay'
    }
    for k, v in team_scheme_mapping.items():
        team_stats_df.loc[team_stats_df['posteam'] == k, 'scheme'] = v

    team_stats_df.to_csv('backend/processed_data/team_seasonal_stats.csv', index=False)
    data['predicted_scheme'] = data.apply(lambda row: team_scheme_mapping.get(row['posteam'], row['predicted_scheme']), axis=1)

    # --- Step 6: Save and Display the Results ---
    with open('scheme.txt', 'w') as f:
        f.write(data[['posteam', 'scheme_scores', 'predicted_scheme']].to_string())
    print(data[['posteam', 'scheme_scores', 'predicted_scheme']])

if __name__ == "__main__":
    apply_offensive_scheme()
