import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

# === 1. Read the Data ===
team_df = pd.read_csv('processed_data/team_seasonal_stats.csv')
wr_df = pd.read_csv('processed_data/fa_wrs.csv')

# === 2. Preprocess WR Data ===
# Replace 0 games with NaN to avoid division by zero
wr_df['games'] = wr_df['games'].replace(0, np.nan)
wr_df['receiving_yards_per_game'] = wr_df['receiving_yards'] / wr_df['games']
wr_df['receiving_tds_per_game'] = wr_df['receiving_tds'] / wr_df['games']
wr_df['receptions_per_game'] = wr_df['receptions'] / wr_df['games']
wr_df['targets_per_game'] = wr_df['targets'] / wr_df['games']
wr_df['receiving_first_downs_per_game'] = wr_df['receiving_first_downs'] / wr_df['games']
wr_df['receiving_2pt_conversions_per_game'] = wr_df.get('receiving_2pt_conversions', 0) / wr_df['games']

# Define columns for production, efficiency, volume, and extra stats
production_cols_wr = [
    'receiving_yards_per_game', 'receiving_tds_per_game',
    'receptions_per_game', 'receiving_first_downs_per_game',
    'receiving_2pt_conversions_per_game'
]
efficiency_cols_wr = [
    'receiving_epa', 'ngs_avg_yac', 'ngs_avg_separation',
    'air_yards_share', 'target_share', 'ngs_catch_percentage'
]
volume_cols = ['receptions_per_game', 'targets_per_game']
# Extra columns (if missing, they are filled with NaN)
ranking_cols_extra = [
    'receiving_air_yards', 'receiving_yards_after_catch',
    'receiving_first_downs', 'receiving_fumbles', 'receiving_fumbles_lost',
    'ngs_avg_expected_yac', 'ngs_avg_intended_air_yards',
    'ngs_avg_yac_above_expectation', 'ngs_percent_share_of_intended_air_yards',
    'racr'
]
for col in ranking_cols_extra:
    if col not in wr_df.columns:
        wr_df[col] = np.nan

# Combine all columns to be imputed and scaled
all_wr_cols = list(set(production_cols_wr + efficiency_cols_wr + volume_cols + ranking_cols_extra))

imputer = SimpleImputer(strategy='median')
wr_imputed = wr_df.copy()
wr_imputed[all_wr_cols] = imputer.fit_transform(wr_imputed[all_wr_cols])

scaler = MinMaxScaler(feature_range=(0.2, 1))
wr_imputed_scaled = wr_imputed.copy()
scaled_cols_wr = ["scaled_" + col for col in all_wr_cols]
wr_imputed_scaled[scaled_cols_wr] = scaler.fit_transform(wr_imputed[all_wr_cols])

# Auxiliary metric: Yards per Reception (YPR)
def safe_ypr(row):
    return row['receiving_yards'] / row['receptions'] if row['receptions'] > 0 else 0
wr_imputed_scaled['ypr'] = wr_imputed_scaled.apply(safe_ypr, axis=1)

# === 3. Bonus Functions for WRs ===
def compute_volume_bonus(wr_row):
    """
    Volume bonus:
      +0.05 if receptions per game ≥ 6
      +0.05 if targets per game ≥ 8
    """
    bonus = 0
    if wr_row['receptions_per_game'] >= 6:
        bonus += 0.05
    if wr_row['targets_per_game'] >= 8:
        bonus += 0.05
    return bonus

def compute_ypr_bonus_wr(wr_row):
    """
    YPR bonus:
      +0.05 if yards per reception exceeds 14
    """
    bonus = 0
    ypr = wr_row.get('ypr', 0)
    if ypr > 14:
        bonus += 0.05
    return bonus

# === 4. Raw Fit Functions for Wideouts ===
def compute_production_score_wr(wr_row):
    """
    Production score is a weighted sum of per-game receiving stats.
      - 40% receiving yards per game
      - 20% receiving TDs per game
      - 20% receptions per game
      - 10% receiving first downs per game
      - 10% receiving 2pt conversions per game
    """
    return (
        0.4 * wr_row['scaled_receiving_yards_per_game'] +
        0.2 * wr_row['scaled_receiving_tds_per_game'] +
        0.2 * wr_row['scaled_receptions_per_game'] +
        0.1 * wr_row['scaled_receiving_first_downs_per_game'] +
        0.1 * wr_row.get('scaled_receiving_2pt_conversions_per_game', 0)
    )

def compute_raw_fit_air_raid_wr(wr_row):
    prod = compute_production_score_wr(wr_row)
    eff = (
        0.30 * wr_row['scaled_receiving_epa'] +
        0.25 * wr_row['scaled_ngs_avg_yac'] +
        0.25 * wr_row['scaled_ngs_avg_separation'] +
        0.20 * wr_row['scaled_ngs_catch_percentage']
    )
    return 0.45 * prod + 0.55 * eff

def compute_raw_fit_spread_option_wr(wr_row):
    prod = compute_production_score_wr(wr_row)
    eff = (
        0.35 * wr_row['scaled_receiving_epa'] +
        0.25 * wr_row['scaled_ngs_avg_yac'] +
        0.20 * wr_row['scaled_ngs_avg_separation'] +
        0.20 * wr_row['scaled_air_yards_share']
    )
    return 0.4 * prod + 0.6 * eff

def compute_raw_fit_west_coast_wr(wr_row):
    prod = compute_production_score_wr(wr_row)
    eff = (
        0.30 * wr_row['scaled_receiving_epa'] +
        0.30 * wr_row['scaled_ngs_avg_yac'] +
        0.20 * wr_row['scaled_ngs_avg_separation'] +
        0.20 * wr_row['scaled_ngs_catch_percentage']
    )
    return 0.4 * prod + 0.6 * eff

def compute_raw_fit_mcvay_wr(wr_row):
    prod = compute_production_score_wr(wr_row)
    eff = (
        0.35 * wr_row['scaled_receiving_epa'] +
        0.25 * wr_row['scaled_ngs_avg_yac'] +
        0.25 * wr_row['scaled_ngs_avg_separation'] +
        0.15 * wr_row.get('scaled_receiving_2pt_conversions_per_game', 0)
    )
    return 0.4 * prod + 0.6 * eff

def compute_raw_fit_shanahan_wr(wr_row):
    prod = compute_production_score_wr(wr_row)
    eff = (
        0.25 * wr_row['scaled_receiving_epa'] +
        0.25 * wr_row['scaled_ngs_avg_yac'] +
        0.25 * wr_row['scaled_ngs_avg_separation'] +
        0.25 * wr_row['scaled_ngs_catch_percentage']
    )
    return 0.5 * prod + 0.5 * eff

def compute_raw_fit_run_power_wr(wr_row):
    prod = compute_production_score_wr(wr_row)
    eff = (
        0.20 * wr_row['scaled_receiving_epa'] +
        0.20 * wr_row['scaled_ngs_avg_yac'] +
        0.30 * wr_row['scaled_ngs_avg_separation'] +
        0.30 * wr_row['scaled_ngs_catch_percentage']
    )
    return 0.35 * prod + 0.65 * eff

def compute_raw_fit_pistol_power_spread_wr(wr_row):
    prod = compute_production_score_wr(wr_row)
    eff = (
        0.30 * wr_row['scaled_receiving_epa'] +
        0.20 * wr_row['scaled_ngs_avg_yac'] +
        0.20 * wr_row['scaled_ngs_avg_separation'] +
        0.15 * wr_row['scaled_target_share'] +
        0.15 * wr_row['scaled_air_yards_share']
    )
    return 0.4 * prod + 0.6 * eff

raw_fit_functions_wr = {
    'air_raid': compute_raw_fit_air_raid_wr,
    'spread_option': compute_raw_fit_spread_option_wr,
    'west_coast': compute_raw_fit_west_coast_wr,
    'mcvay': compute_raw_fit_mcvay_wr,
    'shanahan': compute_raw_fit_shanahan_wr,
    'run_power': compute_raw_fit_run_power_wr,
    'pistol_power_spread': compute_raw_fit_pistol_power_spread_wr
}

# === 5. Scheme Weights for WRs ===
def get_top3_scheme_weights_wr(team_row):
    schemes = {
        'air_raid': team_row['score_air_raid'],
        'spread_option': team_row['score_spread_option'],
        'west_coast': team_row['score_west_coast'],
        'mcvay': team_row['score_west_coast_mcvay'],
        'shanahan': team_row['score_shanahan_wide_zone'],
        'run_power': team_row['score_run_power'],
        'pistol_power_spread': team_row['score_pistol_power_spread']
    }
    sorted_schemes = sorted(schemes.items(), key=lambda x: x[1], reverse=True)
    top3 = sorted_schemes[:3]
    total = sum(score for _, score in top3)
    weights = {scheme: score/total for scheme, score in top3}
    return weights

# === 6. Unified Final Fit Calculation for WRs (No Ranking) ===
def compute_final_fit_wr(wr_row, scheme_weights, raw_fit_functions):
    """
    Computes the final fit score for a WR by:
      - Calculating a base weighted fit across the team's top 3 schemes.
      - Applying a penalty for insufficient games.
      - Adding bonuses for volume, yards-per-reception (YPR), and big name recognition.
    
    Parameters:
      wr_row (pd.Series): A row from the free agent WR dataset.
      scheme_weights (dict): Mapping of scheme names to their weight.
      raw_fit_functions (dict): Mapping of scheme names to their raw fit calculation functions.
    
    Returns:
      float: The final fit score.
    """
    # Calculate the base weighted fit.
    fit_components = {}
    for scheme, weight in scheme_weights.items():
        if scheme in raw_fit_functions:
            fit_components[scheme] = raw_fit_functions[scheme](wr_row)
        else:
            fit_components[scheme] = np.nan

    base_fit = sum(
        scheme_weights[scheme] * fit_components[scheme]
        for scheme in scheme_weights if np.isfinite(fit_components[scheme])
    )
    
    # Penalize for low games played.
    if wr_row['games'] < 9:
        base_fit -= 0.1
    
    # Add volume bonus and YPR bonus.
    base_fit += compute_volume_bonus(wr_row)
    base_fit += compute_ypr_bonus_wr(wr_row)
    
    # Add bonus for "big name" receivers.
    big_name_list = ["Dyami Brown", "DeAndre Hopkins", "Stefon Diggs", "Keenan Allen", "Amari Cooper"]
    if wr_row['player_name'] in big_name_list:
        base_fit += 0.11

    recency_penalty = (2024- int(wr_row['season'])) * 0.05

    return base_fit - recency_penalty

# === 7. Build the (Team, WR) Fit Dataset (No Ranking) ===
records_wr = []
for _, team_row in team_df.iterrows():
    team_name = team_row['team_name']
    scheme_weights = get_top3_scheme_weights_wr(team_row)
    for _, wr_row in wr_imputed_scaled.iterrows():
        wr_name = wr_row['player_name']
        wr_id = wr_row['player_id']
        aav = wr_row.get('market_value', wr_row.get('AAV'))
        prev_team = wr_row['Prev Team']
        age = wr_row['Age']
        games = wr_row['games']
        headshot = wr_row['headshot_url']
        final_fit = compute_final_fit_wr(wr_row, scheme_weights, raw_fit_functions_wr)
        records_wr.append({
            'team_name': team_name,
            'wr_name': wr_name,
            'wr_id': wr_id,
            'aav': aav,
            'prev_team': prev_team,
            'age': age,
            'games': games,
            'headshot': headshot,
            'final_fit': final_fit
        })

fit_wr_df = pd.DataFrame(records_wr)
fit_wr_df = fit_wr_df.dropna(subset=['final_fit'])
print("Sample computed (Team, WR) fit scores:")
print(fit_wr_df[['wr_name', 'final_fit']].head())

# === 8. Train a Simple Linear Regression Model Using a Pipeline (Optional) ===
# Here, we illustrate a basic pipeline. In practice, your target may differ.
features_wr = ['final_fit']  # For example, you might include other features as well.
X_wr = fit_wr_df[['final_fit']]
y_wr = fit_wr_df['final_fit']  # This is illustrative; adjust as needed.
X_train_wr, X_test_wr, y_train_wr, y_test_wr = train_test_split(X_wr, y_wr, test_size=0.2, random_state=42)
pipeline_wr = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('regressor', LinearRegression())
])
pipeline_wr.fit(X_train_wr, y_train_wr)
y_pred_wr = pipeline_wr.predict(X_test_wr)
mse_wr = mean_squared_error(y_test_wr, y_pred_wr)
print("Mean Squared Error for WR model:", mse_wr)

# === 7. Functionalized Full WR Ranking ===
def compute_full_wr_rankings():
    # Load full WR dataset
    full_wr_df = pd.read_csv('processed_data/wr_data.csv')
    full_wr_df['games'] = full_wr_df['games'].replace(0, np.nan)
    full_wr_df['receiving_yards_per_game'] = full_wr_df['receiving_yards'] / full_wr_df['games']
    full_wr_df['receiving_tds_per_game'] = full_wr_df['receiving_tds'] / full_wr_df['games']
    full_wr_df['receptions_per_game'] = full_wr_df['receptions'] / full_wr_df['games']
    full_wr_df['targets_per_game'] = full_wr_df['targets'] / full_wr_df['games']
    full_wr_df['receiving_first_downs_per_game'] = full_wr_df['receiving_first_downs'] / full_wr_df['games']
    full_wr_df['receiving_2pt_conversions_per_game'] = full_wr_df.get('receiving_2pt_conversions', 0) / full_wr_df['games']
    # Ensure extra ranking columns exist
    for col in ranking_cols_extra:
        if col not in full_wr_df.columns:
            full_wr_df[col] = np.nan
    all_wr_cols = list(set(production_cols_wr + efficiency_cols_wr + volume_cols + ranking_cols_extra))
    imputer_local = SimpleImputer(strategy='median')
    scaler_local = MinMaxScaler(feature_range=(0.2, 1))
    full_imputed = full_wr_df.copy()
    full_imputed[all_wr_cols] = imputer_local.fit_transform(full_imputed[all_wr_cols])
    full_imputed_scaled = full_imputed.copy()
    scaled_cols_full = ["scaled_" + col for col in all_wr_cols]
    full_imputed_scaled[scaled_cols_full] = scaler_local.fit_transform(full_imputed[all_wr_cols])
    def safe_ypr_local(row):
        return row['receiving_yards'] / row['receptions'] if row['receptions'] > 0 else 0
    full_imputed_scaled['ypr'] = full_imputed_scaled.apply(safe_ypr_local, axis=1)
    ranking_columns = {
        'receiving_air_yards': 'scaled_receiving_air_yards',
        'receiving_yards_after_catch': 'scaled_receiving_yards_after_catch',
        'receiving_epa': 'scaled_receiving_epa',
        'target_share': 'scaled_target_share',
        'receiving_first_downs': 'scaled_receiving_first_downs',
        'racr': 'scaled_racr',
        'air_yards_share': 'scaled_air_yards_share',
        'receiving_fumbles': 'scaled_receiving_fumbles',
        'receiving_fumbles_lost': 'scaled_receiving_fumbles_lost',
        'ngs_avg_separation': 'scaled_ngs_avg_separation',
        'ngs_avg_intended_air_yards': 'scaled_ngs_avg_intended_air_yards',
        'ngs_catch_percentage': 'scaled_ngs_catch_percentage',
        'ngs_avg_expected_yac': 'scaled_ngs_avg_expected_yac',
        'ngs_percent_share_of_intended_air_yards': 'scaled_ngs_percent_share_of_intended_air_yards',
        'ngs_avg_yac_above_expectation': 'scaled_ngs_avg_yac_above_expectation',
        'ngs_avg_yac': 'scaled_ngs_avg_yac'
    }
    grouped_full_wr = full_imputed_scaled.groupby('player_name').agg({col: 'mean' for col in ranking_columns.values()}).reset_index()
    for metric, scaled_col in ranking_columns.items():
        rank_col = metric + '_rank'
        grouped_full_wr[rank_col] = grouped_full_wr[scaled_col].rank(ascending=False, method='min')
    ranking_wr_df = grouped_full_wr[['player_name'] + [metric + '_rank' for metric in ranking_columns.keys()]]
    return ranking_wr_df

# === 8. Merge Ranking Info into Free Agent WR Fit Dataset ===
ranking_wr_df = compute_full_wr_rankings()
fit_wr_df = fit_wr_df.merge(ranking_wr_df, left_on='wr_name', right_on='player_name', how='left').drop(columns=['player_name'])

print("Final WR Fit Data with Rankings:")
print(fit_wr_df.head())
