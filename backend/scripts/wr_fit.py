import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

# === 1. Read the Data ===
team_df = pd.read_csv('../backend/processed_data/team_seasonal_stats.csv')
wr_df = pd.read_csv('../backend/processed_data/fa_wrs.csv')  # Your WR dataset

# === 2. Preprocess WR Data: Imputation and Scaling ===

# Compute per-game metrics (avoid division by zero by replacing 0 games with NaN)
wr_df['games'] = wr_df['games'].replace(0, np.nan)
wr_df['receiving_yards_per_game'] = wr_df['receiving_yards'] / wr_df['games']
wr_df['receiving_tds_per_game'] = wr_df['receiving_tds'] / wr_df['games']
wr_df['receptions_per_game'] = wr_df['receptions'] / wr_df['games']
wr_df['targets_per_game'] = wr_df['targets'] / wr_df['games']
wr_df['receiving_first_downs_per_game'] = wr_df['receiving_first_downs'] / wr_df['games']
wr_df['receiving_2pt_conversions_per_game'] = wr_df.get('receiving_2pt_conversions', 0) / wr_df['games']

# Define production columns based on per-game stats
production_cols_wr = [
    'receiving_yards_per_game', 'receiving_tds_per_game', 'receptions_per_game', 
    'receiving_first_downs_per_game', 'receiving_2pt_conversions_per_game'
]

# Efficiency/Advanced columns remain unchanged
efficiency_cols_wr = [
    'receiving_epa', 'ngs_avg_yac', 'ngs_avg_separation', 
    'air_yards_share', 'target_share', 'ngs_catch_percentage'
]

# Also include volume columns (for bonus calculation)
volume_cols = ['receptions_per_game', 'targets_per_game']

all_wr_cols = list(set(production_cols_wr + efficiency_cols_wr + volume_cols))

# Impute missing values using median
imputer = SimpleImputer(strategy='median')
wr_imputed = wr_df.copy()
wr_imputed[all_wr_cols] = imputer.fit_transform(wr_imputed[all_wr_cols])

# Scale the columns to the 0.2–1 range (to avoid extremely low scores)
scaler = MinMaxScaler(feature_range=(0.2, 1))
wr_imputed_scaled = wr_imputed.copy()
scaled_cols_wr = ["scaled_" + col for col in all_wr_cols]
wr_imputed_scaled[scaled_cols_wr] = scaler.fit_transform(wr_imputed[all_wr_cols])

# Compute an auxiliary metric: Yards Per Reception (if needed)
def safe_ypr(row):
    return row['receiving_yards'] / row['receptions'] if row['receptions'] > 0 else 0
wr_imputed_scaled['ypr'] = wr_imputed_scaled.apply(safe_ypr, axis=1)

# === 3. Define Functions to Compute Raw Fit Scores for Each Scheme ===

def compute_production_score_wr(wr_row):
    """
    Production score based on per-game receiving stats.
    Weighted sum:
      - 40% scaled receiving yards per game
      - 20% scaled receiving TDs per game
      - 20% scaled receptions per game
      - 10% scaled receiving first downs per game
      - 10% scaled receiving 2pt conversions per game
    """
    return (
        0.4 * wr_row['scaled_receiving_yards_per_game'] +
        0.2 * wr_row['scaled_receiving_tds_per_game'] +
        0.2 * wr_row['scaled_receptions_per_game'] +
        0.1 * wr_row['scaled_receiving_first_downs_per_game'] +
        0.1 * wr_row.get('scaled_receiving_2pt_conversions_per_game', 0)
    )

def compute_volume_bonus(wr_row):
    """
    Volume bonus (per-game):
      +0.05 if receptions per game ≥ 6
      +0.05 if targets per game ≥ 9
    """
    bonus = 0
    if wr_row['receptions_per_game'] >= 6:
        bonus += 0.05
    if wr_row['targets_per_game'] >= 8:
        bonus += 0.05
    return bonus

# Scheme-specific raw fit functions:

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

# === 4. Compute Team's Top 3 Scheme Weights for WRs ===
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
    weights = {scheme: score / total for scheme, score in top3}
    return weights

# === 5. Build the (Team, WR) Fit Dataset ===
records_wr = []
for _, team_row in team_df.iterrows():
    team_name = team_row['team_name']
    scheme_weights = get_top3_scheme_weights_wr(team_row)
    for _, wr_row in wr_imputed_scaled.iterrows():
        wr_name = wr_row['player_name']
        aav = wr_row['AAV']
        prev_team = wr_row['Prev Team']
        age = wr_row['Age']
        headshot = wr_row['headshot_url']
        fit_components = {}
        for scheme, weight in scheme_weights.items():
            if scheme in raw_fit_functions_wr:
                raw_fit = raw_fit_functions_wr[scheme](wr_row)
                fit_components[scheme] = raw_fit
            else:
                fit_components[scheme] = np.nan
        final_fit = sum(scheme_weights[scheme] * fit_components[scheme] for scheme in scheme_weights)
        # Add volume bonus based on per-game receptions and targets
        final_fit += compute_volume_bonus(wr_row)
        records_wr.append({
            'team_name': team_name,
            'wr_name': wr_name,
            'aav': aav,
            'prev_team': prev_team,
            'age': age,
            'headshot': headshot, 
            'final_fit': final_fit,
            'production_score': compute_production_score_wr(wr_row),
            'air_raid_fit': fit_components.get('air_raid', np.nan),
            'spread_option_fit': fit_components.get('spread_option', np.nan),
            'west_coast_fit': fit_components.get('west_coast', np.nan),
            'mcvay_fit': fit_components.get('mcvay', np.nan),
            'shanahan_fit': fit_components.get('shanahan', np.nan),
            'run_power_fit': fit_components.get('run_power', np.nan),
            'pistol_power_spread_fit': fit_components.get('pistol_power_spread', np.nan)
        })

fit_wr_df = pd.DataFrame(records_wr)
print("Sample computed (team, WR) fit scores:")
print(fit_wr_df[['wr_name', 'final_fit']].head())
fit_wr_df = fit_wr_df.dropna(subset=['final_fit'])
print("Number of rows after dropping NaN final_fit:", len(fit_wr_df))

# === 6. Train a Simple Linear Regression Model Using a Pipeline ===
features_wr = ['production_score', 'air_raid_fit', 'spread_option_fit', 'west_coast_fit', 
               'mcvay_fit', 'shanahan_fit', 'run_power_fit', 'pistol_power_spread_fit']
X_wr = fit_wr_df[features_wr]
y_wr = fit_wr_df['final_fit']
X_train_wr, X_test_wr, y_train_wr, y_test_wr = train_test_split(X_wr, y_wr, test_size=0.2, random_state=42)
pipeline_wr = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('regressor', LinearRegression())
])
pipeline_wr.fit(X_train_wr, y_train_wr)
y_pred_wr = pipeline_wr.predict(X_test_wr)
mse_wr = mean_squared_error(y_test_wr, y_pred_wr)
print("Mean Squared Error for WR model:", mse_wr)
