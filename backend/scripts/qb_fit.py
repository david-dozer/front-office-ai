import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.impute import SimpleImputer

# === 1. Read the Data ===
team_df = pd.read_csv('../backend/processed_data/team_seasonal_stats.csv')
qb_df = pd.read_csv('../backend/processed_data/fa_qbs.csv')

# === 2. Preprocess QB Data ===
# Replace 0 games with NaN to avoid division errors
qb_df['games'] = qb_df['games'].replace(0, np.nan)
qb_df['passing_yards'] = qb_df['passing_yards'] - qb_df['passing_yards_after_catch']
# Create a new column for completed air yards.
qb_df['pass_yards_minus_yac'] = qb_df['passing_yards'] - qb_df['passing_yards_after_catch']

qb_df['passing_yards_per_game'] = qb_df['passing_yards'] / qb_df['games']
qb_df['passing_tds_per_game'] = qb_df['passing_tds'] / qb_df['games']
qb_df['completions_per_game'] = qb_df['completions'] / qb_df['games']
qb_df['passing_first_downs_per_game'] = qb_df['passing_first_downs'] / qb_df['games']
qb_df['rushing_yards_per_game'] = qb_df['rushing_yards'] / qb_df['games']
qb_df['rushing_tds_per_game'] = qb_df['rushing_tds'] / qb_df['games']

# Define columns for production and efficiency.
# Note: 'interceptions' is now included.
production_cols_qb = [
    'passing_yards_per_game', 'passing_tds_per_game',
    'completions_per_game', 'passing_first_downs_per_game'
]
efficiency_cols_qb = [
    'passing_epa', 'ngs_passer_rating', 'ngs_completion_percentage',
    'ngs_avg_intended_air_yards', 'ngs_avg_time_to_throw',
    'interceptions'
]
# Additional columns for scheme-specific aspects.
additional_cols_qb = [
    'passing_air_yards', 'passing_yards_after_catch',
    'sacks', 'sack_fumbles', 'sack_yards', 'sack_fumbles_lost',
    'ngs_expected_completion_percentage', 'ngs_completion_percentage_above_expectation'
]
all_qb_cols = list(set(production_cols_qb + efficiency_cols_qb + additional_cols_qb))

# Impute missing values using median.
imputer = SimpleImputer(strategy='median')
qb_imputed = qb_df.copy()
qb_imputed[all_qb_cols] = imputer.fit_transform(qb_imputed[all_qb_cols])

# Scale values to a 0-1 range (here, scaled to between 0.2 and 1).
scaler = MinMaxScaler(feature_range=(0.2, 1))
qb_imputed_scaled = qb_imputed.copy()
scaled_cols_qb = ["scaled_" + col for col in all_qb_cols]
qb_imputed_scaled[scaled_cols_qb] = scaler.fit_transform(qb_imputed[all_qb_cols])

# === 3. Bonus Functions for QBs (to be applied in the app) ===
def compute_rushing_bonus_qb(qb_row):
    """
    Enhanced rushing bonus:
      - No bonus if carries per game is below 3.
      - If carries per game is at least 3, start with a base bonus of 0.05.
      - Then, for carries per game up to 5, add an extra bonus that scales
        with both (carries per game - 3) and (ypc - 3), where ypc is rushing_yards/carries.
      - The total bonus is capped at 0.15.
    
    This rewards both volume (up to 5 carries per game) and efficiency (ypc above 3).
    """
    bonus = 0
    if 'carries' in qb_row and 'games' in qb_row and qb_row['games'] > 1:
        cpg = qb_row['carries'] / qb_row['games']
        if cpg >= 3:
            ypc = qb_row['rushing_yards'] / qb_row['carries'] if qb_row['carries'] > 0 else 0
            # Base bonus for meeting the 3 cpg threshold.
            bonus = 0.05
            # Calculate additional bonus from volume and efficiency:
            # We measure extra carries above 3, capped at 2 extra carries (i.e., up to 5 cpg)
            extra_volume = min(cpg, 5) - 3  # ranges from 0 to 2
            # Also, measure efficiency above a baseline ypc of 3.5
            extra_efficiency = max(0, ypc - 3.5)
            # Scale the additional bonus—here 0.05 per unit of (extra_volume * extra_efficiency)
            additional = 0.05 * (extra_volume * extra_efficiency)
            bonus += additional
            # Cap the total bonus at 0.15.
            bonus = min(bonus, 0.15)
    return bonus

def compute_team_need_bonus(team_row):
    """
    Computes a team need bonus using passing ranking columns, unless the team is excluded.
    
    Excluded teams (with established QBs): 
      "Chicago Bears", "Denver Broncos", "Houston Texans", "Washington Commanders",
      "Carolina Panthers", "Los Angeles Rams", "Kansas City Chiefs", "Philadelphia Eagles", "Arizona Cardinals"
      
    Ranking columns:
      PointsScored_Rank, TotalYds_Rank, TotalTO_Rank, PassingYds_Rank,
      PassingTD_Rank, Int_Rank, Passing1stD_Rank

    Tiers:
      • avg_rank ≥ 28: +0.06 bonus
      • 22 ≤ avg_rank < 28: +0.05 bonus
      • 17 ≤ avg_rank < 22: +0.04 bonus
      • 15 ≤ avg_rank < 17: +0.03 bonus
      • avg_rank < 15: no bonus
    """
    excluded_teams = [
        "Chicago Bears", "Denver Broncos", "Houston Texans", "Washington Commanders",
        "Carolina Panthers", "Los Angeles Rams", "Kansas City Chiefs", "Philadelphia Eagles", "Arizona Cardinals"
        , "Atlanta Falcons", "Dallas Cowboys", "New England Patriots", 
    ]
    
    if team_row['team_name'] in excluded_teams:
        return -0.4  # For excluded teams, you might apply a penalty.
    
    ranking_cols = [
        'PointsScored_Rank', 'TotalYds_Rank',
        'PassingYds_Rank', 'PassingTD_Rank', 'Passing1stD_Rank'
    ]
    avg_rank = team_row[ranking_cols].mean()
    
    bonus = 0
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

# === 4. Raw Fit Functions for Offensive Schemes ===
# Each function combines a production component and an efficiency component.
# A penalty for interceptions is applied in each efficiency component (-0.15 * scaled_interceptions).

# Air Raid (Pass-Favored)
def compute_raw_fit_air_raid_qb(qb_row):
    prod = (
        0.4 * qb_row['scaled_passing_yards_per_game'] +
        0.2 * qb_row['scaled_passing_tds_per_game'] +
        0.2 * qb_row['scaled_completions_per_game'] +
        0.2 * qb_row['scaled_passing_first_downs_per_game']
    )
    eff = (
        0.30 * qb_row['scaled_passing_epa'] +
        0.25 * qb_row['scaled_ngs_avg_time_to_throw'] +
        0.25 * qb_row['scaled_ngs_avg_intended_air_yards'] +
        0.20 * qb_row['scaled_ngs_completion_percentage'] -
        0.25 * qb_row['scaled_interceptions']
    )
    return 0.45 * prod + 0.55 * eff

# Spread Option (RPO-Heavy, Balanced)
def compute_raw_fit_spread_option_qb(qb_row):
    prod = (
        0.35 * qb_row['scaled_passing_yards_per_game'] +
        0.25 * qb_row['scaled_passing_tds_per_game'] +
        0.2 * qb_row['scaled_completions_per_game'] +
        0.2 * qb_row['scaled_passing_first_downs_per_game']
    )
    eff = (
        0.30 * qb_row['scaled_passing_epa'] +
        0.20 * qb_row['scaled_ngs_avg_time_to_throw'] +
        0.30 * qb_row['scaled_ngs_completion_percentage'] +
        0.20 * qb_row['scaled_ngs_passer_rating'] -
        0.25 * qb_row['scaled_interceptions']
    )
    return 0.4 * prod + 0.6 * eff

# West Coast (Pass-Favored)
def compute_raw_fit_west_coast_qb(qb_row):
    prod = (
        0.35 * qb_row['scaled_passing_yards_per_game'] +
        0.25 * qb_row['scaled_passing_tds_per_game'] +
        0.2 * qb_row['scaled_completions_per_game'] +
        0.2 * qb_row['scaled_passing_first_downs_per_game']
    )
    eff = (
        0.30 * qb_row['scaled_passing_epa'] +
        0.30 * qb_row['scaled_ngs_passer_rating'] +
        0.2 * qb_row['scaled_ngs_completion_percentage'] +
        0.2 * qb_row['scaled_ngs_expected_completion_percentage'] -
        0.25 * qb_row['scaled_interceptions']
    )
    return 0.4 * prod + 0.6 * eff

# West Coast McVay (Modern West Coast, Balanced) – including YAC
def compute_raw_fit_west_coast_mcvay_qb(qb_row):
    prod = (
        0.35 * qb_row['scaled_passing_yards_per_game'] +
        0.25 * qb_row['scaled_passing_tds_per_game'] +
        0.2 * qb_row['scaled_completions_per_game'] +
        0.2 * qb_row['scaled_passing_first_downs_per_game']
    )
    eff = (
        0.25 * qb_row['scaled_passing_epa'] +
        0.25 * qb_row['scaled_ngs_passer_rating'] +
        0.25 * qb_row['scaled_ngs_completion_percentage'] +
        0.25 * qb_row['scaled_ngs_avg_intended_air_yards'] -
        0.25 * qb_row['scaled_interceptions']
    )
    yac = qb_row.get('scaled_passing_yards_after_catch', 0)
    return 0.4 * prod + 0.55 * eff + 0.05 * yac

# Shanahan Wide Zone (Run-Favored)
def compute_raw_fit_shanahan_qb(qb_row):
    prod = (
        0.3 * qb_row['scaled_passing_yards_per_game'] +
        0.3 * qb_row['scaled_passing_tds_per_game'] +
        0.2 * qb_row['scaled_completions_per_game'] +
        0.2 * qb_row['scaled_passing_first_downs_per_game']
    )
    eff = (
        0.3 * qb_row['scaled_passing_epa'] +
        0.2 * qb_row['scaled_ngs_passer_rating'] +
        0.3 * qb_row['scaled_ngs_completion_percentage'] +
        0.2 * qb_row['scaled_ngs_completion_percentage_above_expectation'] -
        0.25 * qb_row['scaled_interceptions']
    )
    return 0.5 * prod + 0.5 * eff

# Run Power (Run-Favored)
def compute_raw_fit_run_power_qb(qb_row):
    prod = (
        0.3 * qb_row['scaled_passing_yards_per_game'] +
        0.3 * qb_row['scaled_passing_tds_per_game'] +
        0.2 * qb_row['scaled_completions_per_game'] +
        0.2 * qb_row['scaled_passing_first_downs_per_game']
    )
    eff = (
        0.25 * qb_row['scaled_passing_epa'] +
        0.25 * qb_row['scaled_ngs_passer_rating'] +
        0.25 * qb_row['scaled_ngs_completion_percentage'] +
        0.25 * qb_row['scaled_ngs_expected_completion_percentage'] -
        0.25 * qb_row['scaled_interceptions']
    )
    return 0.35 * prod + 0.65 * eff

# Pistol Power Spread (Balanced)
def compute_raw_fit_pistol_power_spread_qb(qb_row):
    prod = (
        0.35 * qb_row['scaled_passing_yards_per_game'] +
        0.25 * qb_row['scaled_passing_tds_per_game'] +
        0.2 * qb_row['scaled_completions_per_game'] +
        0.2 * qb_row['scaled_passing_first_downs_per_game']
    )
    eff = (
        0.30 * qb_row['scaled_passing_epa'] +
        0.25 * qb_row['scaled_ngs_avg_time_to_throw'] +
        0.25 * qb_row['scaled_ngs_avg_intended_air_yards'] +
        0.20 * qb_row['scaled_ngs_passer_rating'] -
        0.25 * qb_row['scaled_interceptions']
    )
    return 0.4 * prod + 0.6 * eff

raw_fit_functions_qb = {
    'air_raid': compute_raw_fit_air_raid_qb,
    'spread_option': compute_raw_fit_spread_option_qb,
    'west_coast': compute_raw_fit_west_coast_qb,
    'west_coast_mcvay': compute_raw_fit_west_coast_mcvay_qb,
    'shanahan': compute_raw_fit_shanahan_qb,
    'run_power': compute_raw_fit_run_power_qb,
    'pistol_power_spread': compute_raw_fit_pistol_power_spread_qb
}

# === 5. Scheme Weights for QBs ===
def get_top3_scheme_weights_qb(team_row):
    schemes = {
        'air_raid': team_row['score_air_raid'],
        'spread_option': team_row['score_spread_option'],
        'west_coast': team_row['score_west_coast'],
        'west_coast_mcvay': team_row['score_west_coast_mcvay'],
        'shanahan': team_row['score_shanahan_wide_zone'],
        'run_power': team_row['score_run_power'],
        'pistol_power_spread': team_row['score_pistol_power_spread']
    }
    sorted_schemes = sorted(schemes.items(), key=lambda x: x[1], reverse=True)
    top3 = sorted_schemes[:3]
    total = sum(score for _, score in top3)
    weights = {scheme: score/total for scheme, score in top3}
    return weights

# === 6. Compute Final Raw Fit Score for a QB ===
def compute_final_fit_qb(qb_row, scheme_weights, raw_fit_functions, team_need_bonus=0):
    # Calculate base weighted fit from scheme-specific functions.
    fit_components = {}
    for scheme, weight in scheme_weights.items():
        if scheme in raw_fit_functions:
            fit_components[scheme] = raw_fit_functions[scheme](qb_row)
        else:
            fit_components[scheme] = np.nan

    base_fit = sum(
        scheme_weights[scheme] * fit_components[scheme]
        for scheme in scheme_weights if np.isfinite(fit_components[scheme])
    )
    
    # Penalize for low games played.
    if qb_row['games'] < 9:
        base_fit -= 0.1
    
    # Optional recency penalty if season information is available.
    if 'season' in qb_row and pd.notna(qb_row['season']):
        base_fit -= (2024 - int(qb_row['season'])) * 0.05

    return base_fit

# === 5. Build the (Team, QB) Fit Dataset ===
records = []
# Loop over every team.
for _, team_row in team_df.iterrows():
    team_name = team_row['team_name']
    # Get the team's top 3 scheme weights.
    scheme_weights = get_top3_scheme_weights_qb(team_row)
    team_need = compute_team_need_bonus(team_row)
    # Loop over each QB in our (first 15) qb data.
    for _, qb_row in qb_imputed_scaled.iterrows():
        qb_name = qb_row['player_name']
        qb_id = qb_row['player_id']
        aav = qb_row.get('market_value', qb_row.get('AAV'))
        completed_air_yards = qb_row['passing_yards']
        prev_team = qb_row['Prev Team']
        age = qb_row['Age']
        games = qb_row['games']
        headshot = qb_row['headshot_url']
        # Compute raw fit for each scheme in the team's top 3.
        final_fit = compute_final_fit_qb(qb_row, scheme_weights, raw_fit_functions_qb, team_need)
        records.append({
            'team_name': team_name,
            'qb_name': qb_name,
            'qb_id': qb_id,
            'completed_air_yards': completed_air_yards,
            'aav': aav,
            'prev_team': prev_team,
            'age': age,
            'games': games,
            'headshot': headshot, 
            'final_fit': final_fit,
        })

# Create a DataFrame from our records.
fit_qb_df = pd.DataFrame(records)
fit_qb_df = fit_qb_df.dropna(subset=['final_fit'])
print("Sample computed (Team, QB) raw fit scores:")
print(fit_qb_df[['qb_name', 'final_fit']].head())

# === 8. Functionalized Full QB Ranking ===
def compute_full_qb_rankings():
    # Load the full QB dataset (assumed available)
    full_qb_df = pd.read_csv('../backend/processed_data/qb_data.csv')
    full_qb_df['games'] = full_qb_df['games'].replace(0, np.nan)
     # Create a new column: pass_yards_minus_yac = passing_yards - passing_yards_after_catch
    full_qb_df['pass_yards_minus_yac'] = full_qb_df['passing_yards'] - full_qb_df['passing_yards_after_catch']
    
    # Compute per-game stats
    full_qb_df['passing_yards_per_game'] = full_qb_df['passing_yards'] / full_qb_df['games']
    full_qb_df['passing_tds_per_game'] = full_qb_df['passing_tds'] / full_qb_df['games']
    full_qb_df['completions_per_game'] = full_qb_df['completions'] / full_qb_df['games']
    full_qb_df['passing_first_downs_per_game'] = full_qb_df['passing_first_downs'] / full_qb_df['games']
    
    # Define ranking columns for key QB stats including the new pass_yards_minus_yac metric.
    ranking_columns = {
        'passing_air_yards': 'scaled_passing_air_yards',
        'passing_yards_after_catch': 'scaled_passing_yards_after_catch',
        'pass_yards_minus_yac': 'scaled_pass_yards_minus_yac',  # New ranking column
        'passing_epa': 'scaled_passing_epa',
        'sacks': 'scaled_sacks',
        'sack_fumbles': 'scaled_sack_fumbles',
        'passing_first_downs': 'scaled_passing_first_downs',
        'ngs_avg_time_to_throw': 'scaled_ngs_avg_time_to_throw',
        'ngs_avg_intended_air_yards': 'scaled_ngs_avg_intended_air_yards',
        'ngs_completion_percentage': 'scaled_ngs_completion_percentage',
        'ngs_passer_rating': 'scaled_ngs_passer_rating',
        'ngs_expected_completion_percentage': 'scaled_ngs_expected_completion_percentage',
        'ngs_avg_air_yards_differential': 'scaled_ngs_avg_air_yards_differential',
        'ngs_completion_percentage_above_expectation': 'scaled_ngs_completion_percentage_above_expectation',
        'rushing_yards': 'scaled_rushing_yards',
        'carries': 'scaled_carries',
        'rushing_tds': 'scaled_rushing_tds'
    }
    
    # Add any missing columns to the dataset so that they can be imputed.
    for col in ranking_columns.keys():
        if col not in full_qb_df.columns:
            full_qb_df[col] = np.nan
            
    all_cols = list(ranking_columns.keys())
    
    # Impute missing values and scale the data.
    imputer_local = SimpleImputer(strategy='median')
    scaler_local = MinMaxScaler(feature_range=(0.2, 1))
    full_imputed = full_qb_df.copy()
    full_imputed[all_cols] = imputer_local.fit_transform(full_imputed[all_cols])
    full_imputed_scaled = full_imputed.copy()
    scaled_cols_full = ["scaled_" + col for col in all_cols]
    full_imputed_scaled[scaled_cols_full] = scaler_local.fit_transform(full_imputed[all_cols])
    
    # Group by player and compute the average of the scaled stats.
    grouped_full_qb = full_imputed_scaled.groupby('player_name').agg({col: 'mean' for col in scaled_cols_full}).reset_index()
    
    # Rank each metric in descending order (higher values receive a better rank)
    for metric, scaled_col in ranking_columns.items():
        rank_col = metric + '_rank'
        grouped_full_qb[rank_col] = grouped_full_qb[scaled_col].rank(ascending=False, method='min')
        
    ranking_qb_df = grouped_full_qb[['player_name'] + [metric + '_rank' for metric in ranking_columns.keys()]]
    return ranking_qb_df

ranking_qb_df = compute_full_qb_rankings()
fit_qb_df = fit_qb_df.merge(ranking_qb_df, left_on='qb_name', right_on='player_name', how='left').drop(columns=['player_name'])

print("Final QB Fit Data with Rankings:")
print(fit_qb_df.head())
